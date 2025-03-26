# Question Service

## Quick Start

### Environment Files
#### Local
1. Create `.env` file with the following env variables:
```
# For PROD env
DB_CLOUD_URI=<CONNECTION_STRING>
# For LOCAL env
DB_LOCAL_URI=mongodb://admin:password@localhost:8098/peerprep-g02?authSource=admin
RABBITMQ_LOCAL_URI=amqp://admin:password@localhost:5672
REDIS_LOCAL_URL=redis://localhost:6379
PORT=8001
# Possible values: PROD or LOCAL or DOCKER
ENV=LOCAL

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret
```
2. Install dependencies with `npm install`.
3. Start the Question Service with `npm start`.
4. If the server starts successfully, you will see a "Question service server listening on http://localhost:8001" message.

#### Docker
1. Create `.docker.env` file with content:
```
# For PROD env
DB_CLOUD_URI=<CONNECTION_STRING>
# For LOCAL env
DB_LOCAL_URI=mongodb://admin:password@mongodb:27017/peerprep-g02?authSource=admin
RABBITMQ_LOCAL_URI=amqp://admin:password@rabbitmq:5672
REDIS_LOCAL_URL=redis://redis:6379
PORT=8001
# Possible values: PROD or LOCAL
ENV=LOCAL

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret
```
2. From project root `cd question-service/provisioning` then `docker compose up` to start question service

## How question creation works.
1. Create question will create a set (unique) entry in redis. 
2. If category and complexity combo exists then nothing happens.
3. We then send a message to rabbitmq to notify matching service to create the queue.
4. If the create queue message is in-flight and a user tries to match for the category and complexity, rabbitmq will still send the message.
5. Only when the create queue message has reached matching service and creates the consumer, then the user message will be processed.
6. Since rabbitmq queue creation is idempotent (f(f(x))=f(x)), every queue configuration produces the same queue.
7. Since we are not changing the configuration, the queues will not change and nothing is changed in existing queues.

## How question deletion works
1. Using the set (unique) entry populated during question creation, we can check the set in redis to determine if the message should be enqueued.
2. With this logic, we must have a fully populated set so on application start up we'll retrieve all unique category + complexity combinations and populate the redis set.

## Why redis for unique category and complexity combination storage when we have mongodb?
Redis is fast and in-memory and meant for fast operations. There are a lot more benefits but the overall winning 
point was that its either Redis or we create an API on question-service and check mongodb. But this would
mean that all users that tries to match will then have to be checked. From a business POV, it seems that there will
be a lot more requests coming into matching service to match compared to requests coming into question-service to
delete or create a question. With that in mind, the amortized time complexity would favor using redis. Queue creation
and deletion suffers a bit but those aren't too common operations compared to matching.