package com.tripzin.eleganttex.service.impl;

import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderStatus;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.OrderProductImageRepository;
import com.tripzin.eleganttex.repository.OrderRepository;
import com.tripzin.eleganttex.repository.OrderStatusHistoryRepository;
import com.tripzin.eleganttex.service.OrderReportService;
import com.tripzin.eleganttex.service.excel.OrderExcelGenerator;
import com.tripzin.eleganttex.service.pdf.OrderPdfGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Implementation of OrderReportService for handling order reporting operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderReportServiceImpl implements OrderReportService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderProductImageRepository orderProductImageRepository;
    private final OrderPdfGenerator pdfGenerator;
    private final OrderExcelGenerator excelGenerator;

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
        
        // Generate PDF using the dedicated generator
        return pdfGenerator.generateOrderPdf(order);
    }

    /**
     * Generate Excel for orders
     */
    @Override
    public ResponseEntity<Resource> generateOrdersExcel(String statusStr, LocalDate startDate, LocalDate endDate) {
        log.info("Exporting orders to Excel: status={}, startDate={}, endDate={}", statusStr, startDate, endDate);
        
        // Get orders based on filters
        List<Order> orders;
        if (statusStr != null || startDate != null || endDate != null) {
            OrderStatus status = statusStr != null ? OrderStatus.fromString(statusStr) : null;
            Page<Order> orderPage = orderRepository.findByFiltersWithCreatedBy(status, startDate, endDate, null, null, Pageable.unpaged());
            orders = orderPage.getContent();
        } else {
            orders = orderRepository.findAll();
        }
        
        // Generate Excel using the dedicated generator
        return excelGenerator.generateOrdersExcel(orders, statusStr, startDate, endDate);
    }
}
