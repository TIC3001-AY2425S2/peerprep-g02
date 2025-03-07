[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/-9a38Lm0)
# TIC3001 Project

## User Service

### Quick Start

1. In the `user-service` directory, create `.env` file with the following env variables:
```
# For PROD env
DB_CLOUD_URI=<CONNECTION_STRING>
# For LOCAL env
DB_LOCAL_URI=mongodb://admin:password@127.0.0.1:8098/peerprep-g02?authSource=admin
# For DOCKER env
DB_DOCKER_URI=mongodb://admin:password@mongodb:27017/peerprep-g02?authSource=admin
PORT=8000
# Possible values: PROD or LOCAL or DOCKER
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

### Complete Question Service Guide: [Question Service Guide](./question-service/README.md)

## Frontend Service

### Quick Start

1. Navigate to `frontend` directory
2. Install dependencies with `npm install`.
3. Start the Frontend service with `npm start`.
4. If the server starts successfully, you will see a "You can now view frontend in the browser." message.
5. Navigate to http://localhost:3000

# Docker
## Run everything at once
`cd provisioning` then `docker compose up` to run everything at once.
* Add `-d` flag at the end if you want it to just "run in background". Logs can be obtained by using `docker logs -f <container id>` above

## Running services individually in docker
1. From project root `cd provisioning/local/` then `docker compose up` to start local mongodb
2. From project root `cd user-service/provisioning/local` then `docker compose up` to start user service
3. From project root `cd question-service/provisioning/local` then `docker compose up` to start question service
4. From project root `cd frontend/provisioning/local` then `docker compose up` to start frontend service
* Add `-d` flag at the end if you want it to just "run in background". Logs can be obtained by using `docker logs -f <container id>` above.

## Mongodb express (UI to view models)
1. Navigate to localhost:8099
2. login with username: admin, password: pass

## Useful docker commands
### Build an image
`docker build . -t <image_name:version or tag>` to run `Dockerfile` instructions and build an image according to the values specified `-t`
### View all docker images
`docker image ls`
### Start/Stop containers
`docker compose <up/down>` in the `provisioning/local` folder.
* You will lose all your data since the data isn't saved if you docker compose down. Use `ctrl+c` to "pause" the container
* To reset, just `docker compose down` then `docker compose up` again.
### View all containers
`docker container ls`
* From here you can get container information such as container id 
### View container logs in real time
`docker logs -f <container_id>`
### Enter into the container
`docker exec -it <container_id> /bin/sh`
### Encounter an issue?
`docker container prune` and `docker image prune` and `docker system prune`
### Removing an image
`docker image rm <image_name>` or `docker image rm <image_name>:<tag>` if you need specificity

