# Deployment Guide

## Prerequisites
Ensure you have the following installed:
- Docker & Docker Compose
- AWS CLI (if deploying to AWS)
- A cloud VM (e.g., AWS EC2, DigitalOcean Droplet) or Kubernetes cluster

## Environment Variables
Set up the required environment variables in a `.env` file:
```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=your-database-url
DATABASE_USERNAME=your-database-username
DATABASE_PASSWORD=your-database-password
JWT_SECRET=your-jwt-secret
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-email-password
SERVER_PORT=8080
APP_FRONTEND_URL=your-frontend-url
CORS_ALLOWED_ORIGINS=your-allowed-origins
```

## Running Locally
To build and run the project locally:
```bash
docker-compose up --build -d
```
Check running containers:
```bash
docker ps
```
View logs:
```bash
docker-compose logs -f
```

## Deploying to a Cloud Provider
1. **Provision a Virtual Machine**
   - Create an EC2 instance or a DigitalOcean Droplet.
   - Install Docker and Docker Compose.

2. **Copy Project Files**
   - Upload the project files to the server.

3. **Run the Application**
   ```bash
   docker-compose up --build -d
   ```

## Nginx Reverse Proxy
- Nginx is configured to forward requests to the backend.
- Modify `nginx.conf` if needed.

## Monitoring & Logs
To check logs:
```bash
docker-compose logs -f
```
To restart services:
```bash
docker-compose restart
```

## Additional Notes
- Ensure the database is accessible from the backend.
- Use a cloud load balancer if needed.

Let me know if you need further modifications!
