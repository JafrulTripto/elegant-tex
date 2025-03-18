package com.tripzin.eleganttex.service.excel;

import com.tripzin.eleganttex.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Component for generating Excel documents for orders
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderExcelGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Generate an Excel document for a list of orders
     * @param orders The list of orders
     * @param status Optional status filter used in the filename
     * @param startDate Optional start date filter used in the filename
     * @param endDate Optional end date filter used in the filename
     * @return ResponseEntity containing the Excel file as a resource
     */
    public ResponseEntity<Resource> generateOrdersExcel(List<Order> orders, String status, LocalDate startDate, LocalDate endDate) {
        log.info("Exporting {} orders to Excel", orders.size());
        
        try {
            // Create CSV content (simplified for now)
            StringBuilder csvContent = new StringBuilder();
            csvContent.append("ID,Order Number,Created Date,Created By,Status,Marketplace,Customer Name,Customer Phone,Customer Address,Alternative Phone,Facebook ID,Delivery Channel,Delivery Charge,Delivery Date,Products Count,Total Amount\n");
            
            for (Order order : orders) {
                csvContent.append(order.getId()).append(",");
                csvContent.append(order.getOrderNumber()).append(",");
                csvContent.append(order.getCreatedAt().toString()).append(",");
                csvContent.append(order.getCreatedBy().getFirstName()).append(" ").append(order.getCreatedBy().getLastName()).append(",");
                csvContent.append(order.getStatus()).append(",");
                csvContent.append(order.getMarketplace().getName()).append(",");
                csvContent.append(order.getCustomer().getName()).append(",");
                csvContent.append(order.getCustomer().getPhone()).append(",");
                csvContent.append(order.getCustomer().getAddress()).append(",");
                csvContent.append(order.getCustomer().getAlternativePhone() != null ? order.getCustomer().getAlternativePhone() : "").append(",");
                csvContent.append(order.getCustomer().getFacebookId() != null ? order.getCustomer().getFacebookId() : "").append(",");
                csvContent.append(order.getDeliveryChannel()).append(",");
                csvContent.append(order.getDeliveryCharge().doubleValue()).append(",");
                csvContent.append(order.getDeliveryDate().format(DATE_FORMATTER)).append(",");
                csvContent.append(order.getProducts().size()).append(",");
                
                // Calculate total
                BigDecimal total = calculateOrderTotal(order);
                csvContent.append(total.doubleValue()).append("\n");
            }
            
            byte[] excelBytes = csvContent.toString().getBytes();
            
            ByteArrayResource resource = new ByteArrayResource(excelBytes);
            
            // Generate filename based on filters
            String filename = generateFilename(status, startDate, endDate);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .contentLength(excelBytes.length)
                    .body(resource);
        } catch (Exception e) {
            log.error("Error exporting orders to Excel", e);
            throw new RuntimeException("Failed to export orders to Excel", e);
        }
    }
    
    /**
     * Generate a filename for the Excel file based on filters
     */
    private String generateFilename(String status, LocalDate startDate, LocalDate endDate) {
        StringBuilder filename = new StringBuilder("orders");
        
        if (status != null) {
            filename.append("_").append(status.toLowerCase());
        }
        
        if (startDate != null) {
            filename.append("_from_").append(startDate.format(DATE_FORMATTER));
        }
        
        if (endDate != null) {
            filename.append("_to_").append(endDate.format(DATE_FORMATTER));
        }
        
        filename.append(".csv");
        
        return filename.toString();
    }
    
    /**
     * Calculate the total amount for an order
     */
    private BigDecimal calculateOrderTotal(Order order) {
        BigDecimal productTotal = order.getProducts().stream()
                .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return productTotal.add(order.getDeliveryCharge());
    }
}
