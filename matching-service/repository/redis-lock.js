import MessageConfig from '../service/MessageConfig.js';
import UuidUtils from '../utils/UuidUtils.js';
import Redis from './redis.js';

const LOCK_TIMEOUT = 60;
const LOCK_KEY = `lock:queue:${MessageConfig.UPDATES_QUEUE_NAME}`;
const LOCK_VALUE = `${UuidUtils.APP_UUID}`;
let renewalInterval = null;

async function acquireQueueUpdatesLock() {
  // Only set LOCK_KEY : LOCK_VALUE pair if it doesn't exist with 60 seconds TTL.
  // If it is set, it means another matching-service instance/container has already set it.
  return await Redis.client.set(LOCK_KEY, LOCK_VALUE, { NX: true, EX: LOCK_TIMEOUT });
}

async function renewQueueUpdatesLock() {
  try {
    // Renew the lock if it already exists (XX ensures it exists).
    return await Redis.client.set(LOCK_KEY, LOCK_VALUE, { XX: true, EX: LOCK_TIMEOUT });
  } catch (error) {
    throw error;
  }
}

export async function ensureLeadership(onAcquired) {
  const acquired = await acquireQueueUpdatesLock();
  if (acquired) {
    // Start renewal so that we maintain leadership.
    startLockRenewal(() => ensureLeadership(onAcquired));
    onAcquired();
  } else {
    console.log(`${new Date().toISOString()} RedisLock: Lock not acquired. Subscribing for lock expiration.`);
    // Here, pass onAcquired directly rather than wrapping it.
    await subscribeForLockExpiration(onAcquired);
  }
}

export async function subscribeForLockExpiration(onLockAcquired) {
  const subscriber = Redis.subscriber;
  // Listen for expired keys event since we want to know if the lock in redis has expired.
  // If so then we can acquire it and start the queue updates consumer and elect ourselves
  // a new leader.
  await subscriber.subscribe('__keyevent@0__:expired', async (message, channel) => {
    console.log(`RedisLock: ExpiredKeyEvent received message: ${message}`);
    if (message === LOCK_KEY) {
      console.log(`${new Date().toISOString()} RedisLock: Lock expired, attempting to acquire it.`);
      if (await acquireQueueUpdatesLock()) {
        console.log(`${new Date().toISOString()} RedisLock: Lock acquired after expiration.`);
        await subscriber.unsubscribe('__keyevent@0__:expired');
        onLockAcquired();
      }
    }
  });
}

export function startLockRenewal(onRenewalFailure) {
  if (renewalInterval) {
    clearInterval(renewalInterval);
  }

  renewalInterval = setInterval(
    async () => {
      try {
        const result = await renewQueueUpdatesLock();
        if (result !== 'OK') {
          console.error(`${new Date().toISOString()} RedisLock: Failed to renew lock.`);
          stopLockRenewal();
          await subscribeForLockExpiration(onRenewalFailure);
        } else {
          console.log(`${new Date().toISOString()} RedisLock: Lock renewed successfully.`);
        }
      } catch (error) {
        console.error(`${new Date().toISOString()} RedisLock: Error renewing lock:`, error);
        stopLockRenewal();
        await subscribeForLockExpiration(onRenewalFailure);
      }
    },
    LOCK_TIMEOUT * 0.5 * 1000,
  );
}

export function stopLockRenewal() {
  clearInterval(renewalInterval);
  renewalInterval = null;
}

export default { ensureLeadership };
