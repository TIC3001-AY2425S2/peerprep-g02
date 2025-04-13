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
PORT=8002
# Possible values: PROD or LOCAL
ENV=LOCAL

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret

# Services url
QUESTION_SVC_GATEWAY_URL=http://localhost:8080/questions

QUEUE_TIMEOUT=30
```
2. Install dependencies with `npm install`.
3. Start the Question Service with `npm start`.
4. If the server starts successfully, you will see a "Matching service server listening on http://localhost:8002" message.

### Docker
1. Create `.docker.env` file with content:
```
# For PROD env
DB_CLOUD_URI=<CONNECTION_STRING>
# For LOCAL env
DB_LOCAL_URI=mongodb://admin:password@mongodb:27017/peerprep-g02?authSource=admin
RABBITMQ_LOCAL_URI=amqp://admin:password@rabbitmq:5672
REDIS_LOCAL_URL=redis://redis:6379
PORT=8002
# Possible values: PROD or LOCAL
ENV=LOCAL

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret

# Services url
QUESTION_SVC_GATEWAY_URL=http://nginx-gateway:8080/questions

QUEUE_TIMEOUT=30
```
2. From project root `cd match-service/provisioning` then `docker compose up` to start matching service

## How the matching works
1. Retrieve all existing unique category + complexity combinations.
2. Create queues for all of these combinations and additional queue for each category.
3. Whenever a player queues for a category + complexity, send a message containing the player matchmaking details to that queue. 
4. Recursively expand the player's original chosen category + complexity to nearby complexities
5. For example, strings-medium will expand to strings-easy and strings-hard at the same time. strings-easy will expand to strings-medium then strings-hard.
6. The time before an expansion follows a logarithmic function curve.
7. When a match between 2 players occur, there is a delay based on the max expansion of both players to account for better match.
8. For example, player 1 chooses strings-easy and expands to medium and hard. 3 players come in to queue for all 3 difficulties separately. 
9. A match would occur in all 3 queues but the player 1 who chooses strings-easy will have the least amount delay in that queue since that is the original chosen queue. 
