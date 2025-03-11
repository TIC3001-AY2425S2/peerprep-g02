# Question Service

## Quick Start

1. Create `.env` file with the following env variables:
```
# For PROD env
DB_CLOUD_URI=<CONNECTION_STRING>
# For LOCAL env
DB_LOCAL_URI=mongodb://admin:password@127.0.0.1:8098/peerprep-g02?authSource=admin
# For DOCKER env
DB_DOCKER_URI=mongodb://admin:password@mongodb:27017/peerprep-g02?authSource=admin
PORT=8001
# Possible values: PROD or LOCAL or DOCKER
ENV=PROD

# Secret for creating JWT signature
JWT_SECRET=you-can-replace-this-with-your-own-secret
```
2. Install dependencies with `npm install`.
3. Start the Question Service with `npm start`.
4. If the server starts successfully, you will see a "Question service server listening on http://localhost:8001" message.


## How the matching works
TODO: Add matching logic
