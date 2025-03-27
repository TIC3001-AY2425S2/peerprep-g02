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
1. We then send a message to rabbitmq to notify matching service to create the queue.
2. Since rabbitmq queue creation is idempotent (f(f(x))=f(x)), every same queue configuration produces the same queue. 
3. Since we are not changing the configuration, the queues will not change and nothing is changed in existing queues. 
4. That said, when scaling horizontally, we have to register consumers on all containers. 
5. This can be done by sending a create queue event to all containers by using a fanout exchange. 
6. Like its name suggests, a fanout exchange sends messages to all queues bound to it. 
7. This way we can have each container also initialize a consumer so rabbitmq can still perform load balancing since there are now multiple consumers registered. 
8. We then update the redis category + complexity set to have this new entry if it doesn't already exist.
9. While all of the above is happening after step 1, we create the question in mongodb.

## How question deletion works
1. When user tries to delete a question, we first check mongodb to see if it is the last question of its kind of category + complexity.
2. We then determine which category + complexity queue combination can be deleted.
3. We remove that entry from redis and try to delete the queue. 
4. We send a delete event via rabbitmq to matching service consumer - lets call this consumer, update queue consumer. 
5. This update queue consumer sends a kill signal to queue name category + complexity and category queue (using redis which has been updated in step 3) if needed. 
6. Once the kill signal is received from a consumer, we can delete the queue since we know that the queue is empty. 
7. Deleting a queue removes all consumers registered to the queue, so we can still scale horizontally. 
8. Once we identify which queue we want to delete, we can delete the redis entry. 
9. While all of this is happening after step 3, we delete the question. 

## Why redis for unique category and complexity combination storage when we have mongodb?
Redis is fast and in-memory and meant for fast operations. There are a lot more benefits but the overall winning 
point was that its either Redis or we create an API on question-service and check mongodb. But this would
mean that all users that tries to match will then have to be checked. From a business POV, it seems that there will
be a lot more requests coming into matching service to match compared to requests coming into question-service to
delete or create a question. With that in mind, the amortized time complexity would favor using redis. Queue creation
and deletion suffers a bit but those aren't too common operations compared to matching.

## RabbitMQ message acknowledgements.
Acknowledges have 2 kinds depending on the type of queue used. In a normal queue, a consumer
sending an acknowledgement only acknowledges to rabbitmq that the message has been received.
In a publisher/fanout queue, the acknowledgement is from rabbitmq to tell the sender the message
has been broadcast to all queues.

To properly know if a queue has received a message, the sender and receiver both set up another
queue and if the sender receives a message from this other queue, it would mean the message has been
received. It's quite a manual way of doing acknowledgements and the actual purpose of setting up another
queue is called RPC (remote procedure call) where the receiver does some sort of computation and returns the 
results back to the sender via the other queue.

Can read more here: https://www.rabbitmq.com/tutorials/tutorial-six-javascript