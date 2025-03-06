[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/-9a38Lm0)
# TIC3001 Project

## User Service

### Quick Start

1. In the `user-service` directory, create `.env` file with the following env variables:
```
# For PROD env
DB_CLOUD_URI=<CONNECTION_STRING>
# For LOCAL env
DB_LOCAL_URI=<CONNECTION_STRING>
PORT=8000
# Possible values: PROD or LOCAL
ENV=PROD

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret
```
2. Install dependencies with `npm install`.
3. Start the User Service with `npm start`. 
4. If the server starts successfully, you will see a "User service server listening on http://localhost:8000" message.

### Complete User Service Guide: [User Service Guide](./user-service/README.md)

## Question Service

### Quick Start

1. In the `question-service` directory, create `.env` file with the following env variables:
```
# For PROD env
DB_CLOUD_URI=<CONNECTION_STRING>
# For LOCAL env
DB_LOCAL_URI=<CONNECTION_STRING>
PORT=8001
# Possible values: PROD or LOCAL
ENV=PROD

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret
```
2. Install dependencies with `npm install`. 
3. Start the Question Service with `npm start`. 
4. If the server starts successfully, you will see a "Question service server listening on http://localhost:8001" message.

### Complete Question Service Guide: [Question Service Guide](./question-service/README.md)

## Frontend Service

### Quick Start

1. Navigate to `frontend` directory
2. Install dependencies with `npm install`.
3. Start the Frontend service with `npm start`.
4. If the server starts successfully, you will see a "You can now view frontend in the browser." message.
5. Navigate to http://localhost:3000