package com.tripzin.eleganttex.metrics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * This is an example class that demonstrates how to use the OrderMetrics class
 * in a service. This is not meant to be used in production, but rather as a
 * reference for how to integrate metrics collection into your services.
 */
@Service
public class MetricsUsageExample {

    private final OrderMetrics orderMetrics;

    @Autowired
    public MetricsUsageExample(OrderMetrics orderMetrics) {
        this.orderMetrics = orderMetrics;
    }

    /**
     * Example method that would be called when an order is created.
     * 
     * @param marketplaceName The name of the marketplace
     * @param status The status of the order
     * @param totalAmount The total amount of the order
     */
    public void createOrder(String marketplaceName, String status, double totalAmount) {
        // Business logic for creating an order would go here
        
        // Record metrics for the order creation
        orderMetrics.recordOrderCreated(marketplaceName, status, totalAmount);
    }

    /**
     * Example method that would be called when an order status changes.
     * 
     * @param marketplaceName The name of the marketplace
     * @param oldStatus The previous status of the order
     * @param newStatus The new status of the order
     */
    public void updateOrderStatus(String marketplaceName, String oldStatus, String newStatus) {
        // Business logic for updating an order status would go here
        
        // Record metrics for the status change
        orderMetrics.recordOrderStatusChanged(marketplaceName, oldStatus, newStatus);
    }

    /**
     * Example method that would be called when an order is processed.
     * 
     * @param marketplaceName The name of the marketplace
     * @param processingTimeMs The processing time in milliseconds
     */
    public void processOrder(String marketplaceName, long processingTimeMs) {
        // Business logic for processing an order would go here
        
        // Record metrics for the processing time
        orderMetrics.recordOrderProcessingTime(marketplaceName, processingTimeMs);
    }

    /**
     * Example of how to use the metrics in a real service method.
     * This would typically be part of your OrderService or similar.
     */
    public void completeOrderWorkflow(String marketplaceName, double totalAmount) {
        // Start timing the process
        long startTime = System.currentTimeMillis();
        
        try {
            // Create the order
            createOrder(marketplaceName, "PENDING", totalAmount);
            
            // Simulate some processing time
            Thread.sleep(100);
            
            // Update the order status
            updateOrderStatus(marketplaceName, "PENDING", "PROCESSING");
            
            // Simulate more processing time
            Thread.sleep(200);
            
            // Complete the order
            updateOrderStatus(marketplaceName, "PROCESSING", "COMPLETED");
            
        } catch (InterruptedException e) {
            // Handle exception
            updateOrderStatus(marketplaceName, "PROCESSING", "ERROR");
        } finally {
            // Calculate total processing time
            long processingTime = System.currentTimeMillis() - startTime;
            
            // Record the processing time
            orderMetrics.recordOrderProcessingTime(marketplaceName, processingTime);
        }
    }
}
