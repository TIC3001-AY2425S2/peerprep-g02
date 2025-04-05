const APP_UUID = generateUUID();

function generateUUID() {
  return Math.random().toString(36).substring(2, 8);
}

export default { APP_UUID, generateUUID };
