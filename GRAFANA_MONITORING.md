# Grafana Monitoring for Elegant-Tex

This document explains how to use Grafana for monitoring the Elegant-Tex application.

## Overview

The monitoring setup consists of three main components:

1. **Spring Boot Actuator & Micrometer**: Collects metrics from the application
2. **Prometheus**: Stores the metrics as time-series data
3. **Grafana**: Visualizes the metrics in dashboards

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- The Elegant-Tex application built and ready to run

### Starting the Monitoring Stack

The monitoring stack is included in the `docker-compose.yml` file. To start the entire application with monitoring:

```bash
docker-compose up -d
```

This will start:
- The Elegant-Tex application
- PostgreSQL database
- Nginx web server
- Prometheus for metrics collection
- Grafana for visualization

### Accessing the Dashboards

1. **Grafana**: Access Grafana at http://localhost:3000
   - Default credentials: admin/admin
   - Two pre-configured dashboards are available:
     - Spring Boot Metrics: System-level metrics
     - Elegant-Tex Business Metrics: Business-specific metrics

2. **Prometheus**: Access Prometheus at http://localhost:9090
   - Useful for querying raw metrics and debugging

## Available Metrics

### System Metrics

- JVM Memory Usage (heap and non-heap)
- CPU Usage
- HTTP Request Count
- HTTP Response Time
- Garbage Collection Statistics
- Thread Pool Statistics

### Business Metrics

- Order Counts (total, by marketplace, by status)
- Order Processing Time
- Average Order Value
- Order Status Distribution

## Adding Custom Metrics

The `OrderMetrics` class demonstrates how to add custom business metrics to the application. You can extend this approach to add metrics for other business entities.

### Example: Adding a new metric

```java
// In your service class
@Autowired
private OrderMetrics orderMetrics;

public void processOrder(Order order) {
    // Process the order
    
    // Record metrics
    orderMetrics.recordOrderCreated(
        order.getMarketplace().getName(),
        order.getStatus().toString(),
        order.getTotalAmount()
    );
}
```

## Creating Custom Dashboards

While pre-configured dashboards are provided, you can create custom dashboards in Grafana:

1. Log in to Grafana
2. Click "Create" > "Dashboard"
3. Add panels using the metrics available from Prometheus
4. Save your dashboard

## Alerting

Grafana supports alerting based on metric thresholds. To set up alerts:

1. Edit a panel in a dashboard
2. Go to the "Alert" tab
3. Configure alert conditions
4. Add notification channels (email, Slack, etc.)

## Troubleshooting

### No metrics showing in Grafana

1. Check if the application is exposing metrics:
   ```
   curl http://localhost:8080/api/v1/actuator/prometheus
   ```

2. Check if Prometheus is scraping metrics:
   - Go to http://localhost:9090/targets
   - Verify that the "elegant-tex" target is "UP"

3. Check Prometheus queries:
   - Go to http://localhost:9090/graph
   - Try querying basic metrics like `jvm_memory_used_bytes`

### Dashboard shows "No data"

1. Verify the time range in the dashboard
2. Check that the Prometheus data source is configured correctly
3. Verify that the metrics exist in Prometheus

## Advanced Configuration

### Scaling Prometheus

For production environments, consider:
- Increasing storage retention
- Setting up remote storage
- Implementing high availability

### Securing Grafana and Prometheus

For production environments:
- Change default credentials
- Set up proper authentication
- Use HTTPS
- Restrict network access

## Additional Resources

- [Spring Boot Actuator Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Micrometer Documentation](https://micrometer.io/docs)
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [Grafana Documentation](https://grafana.com/docs/)
