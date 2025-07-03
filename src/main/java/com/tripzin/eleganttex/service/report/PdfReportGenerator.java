package com.tripzin.eleganttex.service.report;

import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.service.pdf.OrderPdfGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * PDF implementation of the ReportGenerator interface
 * Delegates to OrderPdfGenerator for single order PDF generation
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PdfReportGenerator implements ReportGenerator {

    private final OrderPdfGenerator orderPdfGenerator;

    /**
     * Generate a PDF report from a list of orders
     * Currently only supports single order PDF generation
     * @param orders The orders to include in the report
     * @param parameters Additional parameters for report generation
     * @return The generated report as a ResponseEntity containing a Resource
     */
    @Override
    public ResponseEntity<Resource> generateReport(List<Order> orders, Map<String, Object> parameters) {
        log.info("Generating PDF report for {} orders", orders.size());
        
        try {
            // Currently we only support generating PDF for a single order
            // In the future, this could be extended to generate a combined PDF report
            if (orders.size() != 1) {
                throw new UnsupportedOperationException("PDF generation is currently only supported for a single order");
            }
            
            Order order = orders.get(0);
            return orderPdfGenerator.generateOrderPdf(order);
        } catch (Exception e) {
            log.error("Error generating PDF report", e);
            throw new com.tripzin.eleganttex.exception.ReportGenerationException("Failed to generate PDF report", e);
        }
    }
}
