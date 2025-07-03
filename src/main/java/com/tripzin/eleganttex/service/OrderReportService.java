package com.tripzin.eleganttex.service;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import com.tripzin.eleganttex.entity.OrderStatus;
import com.tripzin.eleganttex.entity.OrderType;

import java.time.LocalDate;

/**
 * Service interface for order reporting operations
 */
public interface OrderReportService {
    /**
     * Generate PDF for an order
     * @param id Order ID
     * @return ResponseEntity containing the PDF as a resource
     */
    ResponseEntity<Resource> generateOrderPdf(Long id);
    
    /**
     * Generate Excel for orders
     * @param status Optional status filter
     * @param orderType Optional order type filter (MARKETPLACE or MERCHANT)
     * @param startDate Optional start date filter
     * @param endDate Optional end date filter
     * @return ResponseEntity containing the Excel file as a resource
     */
    ResponseEntity<Resource> generateOrdersExcel(OrderStatus status, OrderType orderType, LocalDate startDate, LocalDate endDate);
}
