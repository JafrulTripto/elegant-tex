# Elegant-Tex

A comprehensive platform for textile industries to streamline order management, marketplace integration, and business operations in a unified digital environment.

## Project Overview

Elegant-Tex is a robust web application built with Spring Boot and React that empowers textile industry professionals to efficiently manage their entire business workflow. The platform seamlessly integrates marketplace management, order processing, fabric inventory, and customer relationships while providing powerful analytics for data-driven decision making. Designed specifically for the textile sector, Elegant-Tex addresses the unique challenges of managing complex orders, tracking diverse fabric inventories, and coordinating with multiple marketplaces and customers.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication for secure access control
  - Granular role-based permissions system
  - Email verification to ensure account security
  - Self-service password reset functionality

- **Marketplace Management**
  - Create and manage marketplace listings with customizable properties
  - Advanced search and filter capabilities for quick access
  - Comprehensive marketplace comparison analytics for performance evaluation
  - Collaborative member management with permission controls

- **Order Management**
  - Intuitive interface to create and track orders throughout their lifecycle
  - Configurable order status workflow with automated notifications
  - Secure file attachments for order specifications and requirements
  - Detailed order analytics and reporting for business intelligence
  - Professional PDF invoices and comprehensive Excel export options

- **Fabric Management**
  - Comprehensive catalog to manage fabric inventory with detailed specifications
  - High-quality image uploads for visual fabric representation
  - Flexible tagging system for efficient organization and search
  - Inventory tracking with usage history

- **Customer Management**
  - Detailed customer profiles with communication history
  - Order history tracking for each customer
  - Streamlined customer selection for new orders
  - Customer segmentation capabilities

- **File Storage**
  - Configurable local file storage for development environments
  - Amazon S3 integration for scalable and reliable cloud storage
  - Interactive image preview capabilities with zoom functionality
  - Automatic file organization by entity type

- **Analytics Dashboard**
  - Real-time order statistics with trend analysis
  - Comparative marketplace performance metrics
  - Comprehensive user activity tracking and reporting
  - Interactive visual charts and customizable reports
  - Exportable data for external analysis

## Technical Stack

### Backend
- Java 21
- Spring Boot 3.4.x
- Spring Security with JWT
- PostgreSQL
- Flyway for database migrations
- AWS S3 for file storage
- iText for PDF generation
- Resend/SMTP for email services
- Maven for dependency management
- Spring Boot Actuator & Micrometer for metrics collection
- Prometheus for metrics storage
- Grafana for metrics visualization and monitoring

### Frontend
- React 18
- TypeScript
- Material-UI 6
- Chart.js for analytics
- Formik & Yup for form validation
- Axios for API communication
- Vite for build tooling

## Setup and Installation

### Prerequisites
- Java 21 or higher
- Node.js 18 or higher
- PostgreSQL 15
- AWS account (for S3 storage, optional)

### Backend Setup
1. Clone the repository
2. Configure your environment variables in `.env` file (use `.env.example` as a template)
   ```
   # Required environment variables:
   DATABASE_URL=jdbc:postgresql://localhost:5432/eleganttex
   DATABASE_USERNAME=eleganttex
   DATABASE_PASSWORD=eleganttex
   JWT_SECRET=your-secret-key
   MAIL_USERNAME=your-email@example.com
   MAIL_PASSWORD=your-email-password
   MAIL_FROM=Your Name <your-email@example.com>
   SPRING_PROFILES_ACTIVE=dev
   APP_FRONTEND_URL=http://localhost:3000
   ```
3. Run `./mvnw spring-boot:run` to start the backend server

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### File Storage Configuration
By default, the application uses local file storage. To use AWS S3:

1. Set the following environment variables in your `.env` file:
   ```
   USE_S3_STORAGE=true
   S3_BUCKET_NAME=your-bucket-name
   S3_REGION=your-region
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```
2. Ensure your S3 bucket has the appropriate permissions

## Deployment Options

### Docker Deployment
The application can be deployed using Docker and Docker Compose:

```bash
docker-compose up --build -d
```

For detailed deployment instructions, refer to:
- [Basic Deployment Guide](DEPLOYMENT.md)
- [Deployment Automation Guide](DEPLOYMENT_AUTOMATION.md)
- [S3 Frontend Deployment Guide](S3_FRONTEND_DEPLOYMENT.md)

## API Documentation

API documentation is available at `/api/v1/api-docs` and Swagger UI at `/api/v1/swagger-ui.html` when the application is running.

## Additional Documentation

- [S3 Storage Implementation](S3_STORAGE_README.md) - Details on how file storage works with S3
- [Grafana Monitoring](GRAFANA_MONITORING.md) - Guide on using Grafana for application monitoring

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in `.env` file
   - Ensure database exists and is accessible

2. **Email Sending Failures**
   - Verify email provider configuration
   - Check email credentials in `.env` file
   - For Gmail, ensure "Less secure app access" is enabled or use app passwords

3. **File Upload Issues**
   - Check file size limits in application.yml
   - Verify storage directory permissions
   - For S3, confirm AWS credentials and bucket permissions

4. **Monitoring Issues**
   - Verify Prometheus is running and accessible at http://localhost:9090
   - Check Grafana is running and accessible at http://localhost:3000
   - Ensure the application is exposing metrics at /api/v1/actuator/prometheus
   - Verify Prometheus is correctly scraping metrics from the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.
