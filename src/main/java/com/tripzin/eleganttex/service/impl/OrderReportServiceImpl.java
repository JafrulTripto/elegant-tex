package com.tripzin.eleganttex.service.impl;

import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderStatus;
import com.tripzin.eleganttex.entity.OrderType;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.OrderProductImageRepository;
import com.tripzin.eleganttex.repository.OrderRepository;
import com.tripzin.eleganttex.repository.OrderStatusHistoryRepository;
import com.tripzin.eleganttex.service.OrderReportService;
import com.tripzin.eleganttex.service.report.ReportGenerator;
import org.springframework.beans.factory.annotation.Qualifier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of OrderReportService for handling order reporting operations
 */
@Service
@Slf4j
public class OrderReportServiceImpl implements OrderReportService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderProductImageRepository orderProductImageRepository;
    private final ReportGenerator pdfReportGenerator;
    private final ReportGenerator excelReportGenerator;
    
    public OrderReportServiceImpl(
            OrderRepository orderRepository,
            OrderStatusHistoryRepository orderStatusHistoryRepository,
            OrderProductImageRepository orderProductImageRepository,
            @Qualifier("pdfReportGenerator") ReportGenerator pdfReportGenerator,
            @Qualifier("excelReportGenerator") ReportGenerator excelReportGenerator) {
        this.orderRepository = orderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.orderProductImageRepository = orderProductImageRepository;
        this.pdfReportGenerator = pdfReportGenerator;
        this.excelReportGenerator = excelReportGenerator;
    }

    /**
     * Generate PDF for an order
     */
    @Override
    public ResponseEntity<Resource> generateOrderPdf(Long id) {
        log.info("Generating PDF for order with ID: {}", id);
        
        Order order = orderRepository.findByIdWithProductsAndFabrics(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        
        // Load status history
        order.setStatusHistory(orderStatusHistoryRepository.findByOrderIdWithUserOrderByTimestampDesc(id));
        
        // Load product images for each product
        order.getProducts().forEach(product -> 
            product.setImages(orderProductImageRepository.findByOrderProductId(product.getId()))
        );
        
        // Create a list with just this order
        List<Order> orders = List.of(order);
        
        // Create parameters map (empty for now)
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("orderId", id);
        
        // Generate PDF using the report generator
        return pdfReportGenerator.generateReport(orders, parameters);
    }

    /**
     * Generate Excel for orders
     */
    @Override
    public ResponseEntity<Resource> generateOrdersExcel(OrderStatus statusStr, OrderType orderType, LocalDate startDate, LocalDate endDate) {
        log.info("Exporting orders to Excel: status={}, orderType={}, startDate={}, endDate={}", statusStr, orderType, startDate, endDate);
        
        // Get orders based on filters
        List<Order> orders;
        
        // Use findAll() and filter in memory for simplicity
        // This avoids potential database-specific issues with parameter types
        orders = orderRepository.findByFiltersForExcel(statusStr, orderType, startDate, endDate);
        // Create parameters map
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("status", statusStr);
        parameters.put("orderType", orderType != null ? orderType.name() : null);
        parameters.put("startDate", startDate);
        parameters.put("endDate", endDate);
        
        // Generate Excel using the report generator
        return excelReportGenerator.generateReport(orders, parameters);
    }
}
