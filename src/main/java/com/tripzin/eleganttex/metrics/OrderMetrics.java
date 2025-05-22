package com.tripzin.eleganttex.metrics;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import org.springframework.stereotype.Component;

/**
 * Component for recording custom metrics related to orders.
 * This demonstrates how to track business-specific metrics in the application.
 */
@Component
public class OrderMetrics {
    private final MeterRegistry meterRegistry;
    
    public OrderMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        // Initialize counters with 0 to ensure they appear in Grafana even before first increment
        meterRegistry.counter("orders.created.total").increment(0);
        meterRegistry.counter("orders.completed.total").increment(0);
        meterRegistry.counter("orders.cancelled.total").increment(0);
    }
    
    /**
     * Record metrics when an order is created
     * 
     * @param marketplaceName The name of the marketplace
     * @param status The status of the order
     * @param totalAmount The total amount of the order
     */
    public void recordOrderCreated(String marketplaceName, String status, double totalAmount) {
        // Increment the total orders counter
        meterRegistry.counter("orders.created.total").increment();
        
        // Increment the marketplace-specific counter
        meterRegistry.counter("orders.created", 
            Tags.of("marketplace", marketplaceName, 
                   "status", status))
            .increment();
            
        // Record the order value as a distribution summary
        meterRegistry.summary("order.value", 
            Tags.of("marketplace", marketplaceName))
            .record(totalAmount);
    }
    
    /**
     * Record metrics when an order status changes
     * 
     * @param marketplaceName The name of the marketplace
     * @param oldStatus The previous status of the order
     * @param newStatus The new status of the order
     */
    public void recordOrderStatusChanged(String marketplaceName, String oldStatus, String newStatus) {
        // Increment status-specific counters
        if ("COMPLETED".equals(newStatus)) {
            meterRegistry.counter("orders.completed.total").increment();
            meterRegistry.counter("orders.completed", 
                Tags.of("marketplace", marketplaceName))
                .increment();
        } else if ("CANCELLED".equals(newStatus)) {
            meterRegistry.counter("orders.cancelled.total").increment();
            meterRegistry.counter("orders.cancelled", 
                Tags.of("marketplace", marketplaceName))
                .increment();
        }
        
        // Record the status transition
        meterRegistry.counter("orders.status.transition", 
            Tags.of("marketplace", marketplaceName,
                   "from", oldStatus,
                   "to", newStatus))
            .increment();
    }
    
    /**
     * Record metrics for processing time of an order
     * 
     * @param marketplaceName The name of the marketplace
     * @param processingTimeMs The processing time in milliseconds
     */
    public void recordOrderProcessingTime(String marketplaceName, long processingTimeMs) {
        meterRegistry.timer("orders.processing.time", 
            Tags.of("marketplace", marketplaceName))
            .record(processingTimeMs, java.util.concurrent.TimeUnit.MILLISECONDS);
    }
}
