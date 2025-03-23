## Environment files
Create `.env` file with the content:
```
USER_SERVICE_URL=host.docker.internal:8000
QUESTION_SERVICE_URL=host.docker.internal:8001
MATCHING_SERVICE_URL=host.docker.internal:8002
```

## Authentication system using NGINX

In using JWT to authenticate users, we now have a flow of the following:
1. A user logs in via user-service's `/auth/login` route.
2. User service then checks the credentials and creates a token with the user details
3. The token is signed using the JWT secret in your .env file and returns it back as a response. 
4. The user will then have to use this token in all API calls that requires permissions. 
5. This token is then used to authenticate the user from now on in all endpoints via user-service's `auth/verify-token`. 
6. So to say for any endpoint that requires a user with special permissions such as isAdmin, we'll have to check the token.

Then comes the big question, is it I must verify the token everytime I make an API call? Yes this must be done. 

Which is where nginx can come in. NGINX can do an api call to `auth/verify-token` with the given token for verification 
so each  individual service do not have to do it anymore or the frontend does not need to do this.

Each microservice should just be concerned with verifying and decoding the token to check its contents which would 
contain non-sensitive user details and verify that this user indeed has permissions.

What this further means is that each microservice would need to have a `decodeAccessToken`, `verifyIsAdmin`, 
`verifyIsOwnerOrAdmin` middleware similar to how user-service does it. But no need to call user-service's 
`auth/verify-token` manually anymore since nginx is doing that, and it has caching feature anyway. 