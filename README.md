# task-manager-api
Task manager api with authentication user and email notifications

## Before Running

Install all the dependencies

```
npm install
```

and create the .env file 

```
SENDGRID_API_KEY=[access token from email automation API]
JWT_SECRET=[password of your choice]
MONGODB_URL=[databse url (for example: mongodb://127.0.0.1:27017/task-manager-api)]
```

The API is free, it just needs to sign up.

Email automation API - [SendGrid](https://sendgrid.com/)

For the mongo database you can install mongodb in your machine or create a cloud database for free in [MongoDB site](https://www.mongodb.com/)