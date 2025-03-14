# Question Service

## Quick Start

### Local
1. Create `.env` file with the following env variables:
```
# For PROD env
DB_CLOUD_URI=<CONNECTION_STRING>
# For LOCAL env
DB_LOCAL_URI=mongodb://admin:password@127.0.0.1:8098/peerprep-g02?authSource=admin
RABBITMQ_LOCAL_URI=amqp://admin:pass@localhost:5672
PORT=8002
# Possible values: PROD or LOCAL
ENV=PROD

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret

# Services url
QUESTION_SVC_GATEWAY_URL=http://api-gateway:8080/questions

QUEUE_TIMEOUT=20
DEAD_LETTER_QUEUE_TIMEOUT=10
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
RABBITMQ_LOCAL_URI=amqp://admin:pass@rabbitmq:5672
PORT=8002
# Possible values: PROD or LOCAL
ENV=PROD

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret

# Services url
QUESTION_SVC_GATEWAY_URL=http://api-gateway:8080/questions

QUEUE_TIMEOUT=20
DEAD_LETTER_QUEUE_TIMEOUT=10
```
2. From project root `cd match-service/provisioning` then `docker compose up` to start matching service
## How the matching works
TODO: Add matching logic
