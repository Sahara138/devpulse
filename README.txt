# DevPulse API
A RESTful Issue Tracking API built with **Node.js**, **Express.js**, **TypeScript**, and **PostgreSQL**. The project provides secure JWT-based authentication and role-based authorization for managing software issues.


## Live URL
https://your-api-url.com


# Features

### Authentication
* User Registration
* User Login
* JWT Authentication
* Password Hashing using bcryptjs
* Role-based Authorization (Contributor & Maintainer)

### Issues Management
* Create Issue
* Get All Issues
* Get Single Issue
* Update Issue
* Delete Issue
* Filtering by Status
* Filtering by Type
* Sorting by Newest/Oldest

### Security
* JWT Protected Routes
* Password Encryption
* Middleware-based Authentication
* Role-based Permission Handling



# Tech Stack

## Backend
* Node.js
* Express.js
* TypeScript

## Database
* PostgreSQL

## Authentication
* JSON Web Token (JWT)
* bcryptjs

## Environment
* dotenv

## Development
* tsx


# Project Structure

src
│
├── app
│   ├── modules
│   │   ├── auth
│   │   └── issue
│   │
│   ├── middleware
│   ├── routes
│   ├── services
│   ├── utility
│   └── interfaces
│
├── config
├── db
├── server.ts
└── app.ts
```

---

# Installation

## Clone the repository
git clone https://github.com/your-username/devpulse.git


Move into the project
cd devpulse

Install dependencies
npm install


Create a `.env` file

CONNECTION_STRING="postgresql://neondb_owner:npg_sN30oRMSYwbX@ep-holy-dawn-atrstttn-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="your secret key"
JWT_REFRESH_SECRET="your refresh_secret key"
PORT=3000


Run the development server
npm run dev


# API Endpoints

## Authentication

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| POST   | `/api/auth/signup` | Register a new user |
| POST   | `/api/auth/login`  | Login user          |


## Issues

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| POST   | `/api/issues`     | Create Issue     |
| GET    | `/api/issues`     | Get All Issues   |
| GET    | `/api/issues/:id` | Get Single Issue |
| PATCH  | `/api/issues/:id` | Update Issue     |
| DELETE | `/api/issues/:id` | Delete Issue     |


# Query Parameters

## Get All Issues

GET /api/issues
Supported Query Parameters

| Query  | Values                      |
| ------ | --------------------------- |
| sort   | newest, oldest              |
| type   | bug, feature_request        |
| status | open, in_progress, resolved |

Example
GET /api/issues?sort=newest&type=bug&status=open


#  Authorization Rules

## Contributor

- Register
- Login
- Create Issue
- View Issues
- Update Own Issue (Only when status is open)
- Delete Issue - only for maintainer

## Maintainer

- Register
- Login
- Create Issue
- View Issues
- Update Any Issue
- Delete Any Issue

# Database Schema Summary

## Users Table

| Field      | Type                     |
| ---------- | ------------------------ |
| id         | SERIAL                   |
| name       | VARCHAR                  |
| email      | VARCHAR                  |
| password   | VARCHAR                  |
| role       | contributor / maintainer |
| created_at | TIMESTAMP                |
| updated_at | TIMESTAMP                |

## Issues Table

| Field       | Type                          |
| ----------- | ----------------------------- |
| id          | SERIAL                        |
| title       | VARCHAR                       |
| description | TEXT                          |
| type        | bug / feature_request         |
| status      | open / in_progress / resolved |
| reporter_id | INTEGER                  |
| created_at  | TIMESTAMP                     |
| updated_at  | TIMESTAMP                     |


# Environment Variables

Create a `.env` file with the following variables:

CONNECTION_STRING="postgresql://neondb_owner:npg_sN30oRMSYwbX@ep-holy-dawn-atrstttn-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="your secret key"
JWT_REFRESH_SECRET="your refresh_secret key"
PORT=3000


# Sample Login Credentials

Create a user first using the signup endpoint.

Then login using

{
  "email": "saharaiislam586@gmail.com",
  "password": "123"
}


# Available Scripts

Install dependencies
npm install


Run development server
npm run dev



# Dependencies

### Production

* express
* pg
* bcryptjs
* jsonwebtoken
* dotenv
* cors

### Development

* typescript
* tsx
* @types/express
* @types/jsonwebtoken
* @types/pg
* @types/cors

