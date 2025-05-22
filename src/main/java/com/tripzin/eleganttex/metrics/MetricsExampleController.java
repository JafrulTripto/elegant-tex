package com.tripzin.eleganttex.metrics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.micrometer.core.annotation.Timed;
import lombok.Data;

/**
 * Example controller that demonstrates how to use metrics in a REST API.
 * This is not meant to be used in production, but rather as a reference
 * for how to integrate metrics collection into your controllers.
 */
@RestController
@RequestMapping("/api/v1/metrics-example")
public class MetricsExampleController {

    private final MetricsUsageExample metricsUsageExample;

    @Autowired
    public MetricsExampleController(MetricsUsageExample metricsUsageExample) {
        this.metricsUsageExample = metricsUsageExample;
    }

    /**
     * Example endpoint that creates an order and records metrics.
     * The @Timed annotation automatically records the execution time of this method.
     * 
     * @param request The order request
     * @return A response entity
     */
    @PostMapping("/orders")
    @Timed(value = "api.create.order", description = "Time taken to create an order")
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
        // Call the service method that records metrics
        metricsUsageExample.createOrder(
            request.getMarketplaceName(),
            "PENDING",
            request.getTotalAmount()
        );
        
        // Return a response
        OrderResponse response = new OrderResponse();
        response.setOrderId("ORD-" + System.currentTimeMillis());
        response.setStatus("PENDING");
        response.setMessage("Order created successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Example endpoint that simulates a complete order workflow and records metrics.
     * 
     * @param request The order request
     * @return A response entity
     */
    @PostMapping("/orders/complete-workflow")
    @Timed(value = "api.complete.order.workflow", description = "Time taken to complete an order workflow")
    public ResponseEntity<OrderResponse> completeOrderWorkflow(@RequestBody OrderRequest request) {
        // Call the service method that records metrics
        metricsUsageExample.completeOrderWorkflow(
            request.getMarketplaceName(),
            request.getTotalAmount()
        );
        
        // Return a response
        OrderResponse response = new OrderResponse();
        response.setOrderId("ORD-" + System.currentTimeMillis());
        response.setStatus("COMPLETED");
        response.setMessage("Order workflow completed successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Example request DTO for order creation.
     */
    @Data
    public static class OrderRequest {
        private String marketplaceName;
        private double totalAmount;
    }

    /**
     * Example response DTO for order creation.
     */
    @Data
    public static class OrderResponse {
        private String orderId;
        private String status;
        private String message;
    }
}
