# Elegant-Tex

A platform for tech professionals to connect, collaborate, and share resources.

## Project Overview

Elegant-Tex (formerly TechMinds) is a web application built with Spring Boot and React that provides a marketplace for tech professionals to connect and collaborate.

## Features

- User authentication and authorization
- Marketplace listings
- File storage and management
- User profiles
- Admin dashboard

## Technical Stack

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security with JWT
- PostgreSQL
- Flyway for database migrations
- Maven

### Frontend
- React 18
- TypeScript
- Material-UI
- Vite

## Setup and Installation

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- PostgreSQL 15

### Backend Setup
1. Clone the repository
2. Configure your database in `.env` file (use `.env.example` as a template)
3. Run `./mvnw spring-boot:run` to start the backend server

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## API Documentation

API documentation is available at `/api-docs` and Swagger UI at `/swagger-ui.html` when the application is running.

## Recent Changes

- Renamed project from TechMinds to Elegant-Tex
- Added marketplace functionality
- Implemented file storage system
- Fixed static resource handling for marketplaces

## License

This project is licensed under the MIT License - see the LICENSE file for details.
