package com.tripzin.eleganttex.service;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

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
     * @param startDate Optional start date filter
     * @param endDate Optional end date filter
     * @return ResponseEntity containing the Excel file as a resource
     */
    ResponseEntity<Resource> generateOrdersExcel(String status, LocalDate startDate, LocalDate endDate);
}
