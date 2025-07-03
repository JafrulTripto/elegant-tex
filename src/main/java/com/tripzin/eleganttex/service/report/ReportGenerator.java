package com.tripzin.eleganttex.service.report;

import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.exception.ReportGenerationException;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

/**
 * Interface for report generators
 */
public interface ReportGenerator {
    
    /**
     * Generate a report from a list of orders
     * @param orders The orders to include in the report
     * @param parameters Additional parameters for report generation
     * @return The generated report as a ResponseEntity containing a Resource
     * @throws ReportGenerationException if there is an error generating the report
     */
    ResponseEntity<Resource> generateReport(List<Order> orders, Map<String, Object> parameters);
}
