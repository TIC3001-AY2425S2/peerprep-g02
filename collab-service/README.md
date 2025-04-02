# Question Service

## Quick Start

### Local
1. Create `.env` file with the following env variables:
```
# For PROD env
DB_CLOUD_URI=<CONNECTION_STRING>
# For LOCAL env
DB_LOCAL_URI=mongodb://admin:password@127.0.0.1:8098/peerprep-g02?authSource=admin
RABBITMQ_LOCAL_URI=amqp://admin:password@localhost:5672
REDIS_LOCAL_URL=redis://localhost:6379
PORT=8003
# Possible values: PROD or LOCAL
ENV=LOCAL

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret

# Services url
QUESTION_SVC_GATEWAY_URL=http://localhost:8080/questions

```
2. Install dependencies with `npm install`.
3. Start the Question Service with `npm start`.
4. If the server starts successfully, you will see a "Collaboration service server listening on http://localhost:8002" message.

### Docker
1. Create `.docker.env` file with content:
```
# For PROD env
DB_CLOUD_URI=<CONNECTION_STRING>
# For LOCAL env
DB_LOCAL_URI=mongodb://admin:password@mongodb:27017/peerprep-g02?authSource=admin
RABBITMQ_LOCAL_URI=amqp://admin:password@rabbitmq:5672
REDIS_LOCAL_URL=redis://redis:6379
PORT=8003
# Possible values: PROD or LOCAL
ENV=LOCAL

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret

# Services url
QUESTION_SVC_GATEWAY_URL=http://nginx-gateway:8080/questions

```
2. From project root `cd match-service/provisioning` then `docker compose up` to start collaboration service

## How the collaboration works
1. Retrieve all existing unique category + complexity combinations.
2. Create queues for all of these combinations and additional queue for each category.
3. Whenever a player queues for a category + complexity, send a message containing the player matchmaking details to that queue. 
4. If another player chooses the same combination, we now have 2 players matchmaking details being sent into 1 queue and can now match them up.
5. If a queue continues to only have a single player in it, the player is then brought to the category queue where players of different complexities but same category will match each other. 
