package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.request.OrderProductRequest;
import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderProduct;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service for handling order calculations
 */
@Service
public class OrderCalculationService {

    /**
     * Calculate total amount for an order based on its products and delivery charge
     * @param order The order entity
     * @return The calculated total amount
     */
    public BigDecimal calculateOrderTotal(Order order) {
        BigDecimal productTotal = calculateProductsTotal(order.getProducts());
        return productTotal.add(order.getDeliveryCharge());
    }
    
    /**
     * Calculate total amount for a list of order products
     * @param products List of order products
     * @return The calculated total amount
     */
    public BigDecimal calculateProductsTotal(List<OrderProduct> products) {
        return products.stream()
                .map(this::calculateProductSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Calculate subtotal for a single order product
     * @param product The order product
     * @return The calculated subtotal
     */
    public BigDecimal calculateProductSubtotal(OrderProduct product) {
        return product.getPrice().multiply(new BigDecimal(product.getQuantity()));
    }
    
    /**
     * Calculate total amount from order product requests
     * @param products List of order product requests
     * @return The calculated total amount
     */
    public BigDecimal calculateTotalFromRequests(List<OrderProductRequest> products) {
        return products.stream()
                .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
