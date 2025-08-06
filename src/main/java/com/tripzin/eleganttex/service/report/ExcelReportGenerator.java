package com.tripzin.eleganttex.service.report;

import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderProduct;
import com.tripzin.eleganttex.entity.OrderType;
import com.tripzin.eleganttex.exception.ReportGenerationException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Excel implementation of the ReportGenerator interface
 * Generates Excel reports for orders
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ExcelReportGenerator implements ReportGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String[] ORDER_HEADERS = {
        "ID", "Order Number", "Created Date", "Created By", "Status", "Order Type", 
        "Marketplace", "Customer Name", "Customer Phone", "Customer Address", 
        "Alternative Phone", "Facebook ID", "Delivery Channel", "Delivery Charge", 
        "Delivery Date", "Products Count", "Total Amount"
    };
    
    private static final String[] PRODUCT_HEADERS = {
        "Order ID", "Order Number", "Product Type", "Fabric", "Quantity", 
        "Price", "Description"
    };

    /**
     * Generate an Excel report from a list of orders
     * @param orders The orders to include in the report
     * @param parameters Additional parameters for report generation
     * @return The generated report as a ResponseEntity containing a Resource
     * @throws ReportGenerationException if there is an error generating the report
     */
    @Override
    public ResponseEntity<Resource> generateReport(List<Order> orders, Map<String, Object> parameters) {
        log.info("Exporting {} orders to Excel", orders.size());
        
        // Extract parameters
        String status = (String) parameters.get("status");
        String orderType = (String) parameters.get("orderType");
        LocalDate startDate = (LocalDate) parameters.get("startDate");
        LocalDate endDate = (LocalDate) parameters.get("endDate");
        
        try (Workbook workbook = new XSSFWorkbook()) {
            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            
            // Create Orders sheet
            Sheet ordersSheet = workbook.createSheet("Orders");
            createOrdersSheet(ordersSheet, orders, headerStyle, dateStyle, currencyStyle);
            
            // Create Products sheet
            Sheet productsSheet = workbook.createSheet("Products");
            createProductsSheet(productsSheet, orders, headerStyle, currencyStyle);
            
            // Auto-size columns for both sheets
            for (int i = 0; i < ORDER_HEADERS.length; i++) {
                ordersSheet.autoSizeColumn(i);
            }
            
            for (int i = 0; i < PRODUCT_HEADERS.length; i++) {
                productsSheet.autoSizeColumn(i);
            }
            
            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            byte[] excelBytes = outputStream.toByteArray();
            
            ByteArrayResource resource = new ByteArrayResource(excelBytes);
            
            // Generate filename based on filters
            String filename = generateFilename(status, orderType, startDate, endDate);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .contentLength(excelBytes.length)
                    .body(resource);
        } catch (Exception e) {
            log.error("Error exporting orders to Excel", e);
            throw new com.tripzin.eleganttex.exception.ReportGenerationException("Failed to export orders to Excel", e);
        }
    }
    
    /**
     * Create the Orders sheet with order data
     */
    private void createOrdersSheet(
            Sheet sheet, 
            List<Order> orders, 
            CellStyle headerStyle, 
            CellStyle dateStyle, 
            CellStyle currencyStyle) {
        
        // Create header row
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < ORDER_HEADERS.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(ORDER_HEADERS[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Create data rows
        int rowNum = 1;
        for (Order order : orders) {
            Row row = sheet.createRow(rowNum++);
            
            int colNum = 0;
            row.createCell(colNum++).setCellValue(order.getId());
            row.createCell(colNum++).setCellValue(order.getOrderNumber());
            
            Cell createdAtCell = row.createCell(colNum++);
            createdAtCell.setCellValue(order.getCreatedAt().toString());
            createdAtCell.setCellStyle(dateStyle);
            
            row.createCell(colNum++).setCellValue(
                order.getCreatedBy().getFirstName() + " " + order.getCreatedBy().getLastName());
            row.createCell(colNum++).setCellValue(order.getStatus().toString());
            row.createCell(colNum++).setCellValue(order.getOrderType().toString());
            row.createCell(colNum++).setCellValue(order.getMarketplace() != null ? order.getMarketplace().getName() : OrderType.MERCHANT.toString());
            row.createCell(colNum++).setCellValue(order.getCustomer().getName());
            row.createCell(colNum++).setCellValue(order.getCustomer().getPhone());
            row.createCell(colNum++).setCellValue(order.getCustomer().getDisplayAddress());
            
            String altPhone = order.getCustomer().getAlternativePhone();
            row.createCell(colNum++).setCellValue(altPhone != null ? altPhone : "");
            
            String facebookId = order.getCustomer().getFacebookId();
            row.createCell(colNum++).setCellValue(facebookId != null ? facebookId : "");
            
            row.createCell(colNum++).setCellValue(order.getDeliveryChannel());
            
            Cell deliveryChargeCell = row.createCell(colNum++);
            deliveryChargeCell.setCellValue(order.getDeliveryCharge().doubleValue());
            deliveryChargeCell.setCellStyle(currencyStyle);
            
            Cell deliveryDateCell = row.createCell(colNum++);
            deliveryDateCell.setCellValue(order.getDeliveryDate().format(DATE_FORMATTER));
            deliveryDateCell.setCellStyle(dateStyle);
            
            row.createCell(colNum++).setCellValue(order.getProducts().size());
            
            // Calculate total
            BigDecimal total = calculateOrderTotal(order);
            Cell totalCell = row.createCell(colNum++);
            totalCell.setCellValue(total.doubleValue());
            totalCell.setCellStyle(currencyStyle);
        }
    }
    
    /**
     * Create the Products sheet with product data
     */
    private void createProductsSheet(
            Sheet sheet, 
            List<Order> orders, 
            CellStyle headerStyle, 
            CellStyle currencyStyle) {
        
        // Create header row
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < PRODUCT_HEADERS.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(PRODUCT_HEADERS[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Create data rows
        int rowNum = 1;
        for (Order order : orders) {
            for (OrderProduct product : order.getProducts()) {
                Row row = sheet.createRow(rowNum++);
                
                int colNum = 0;
                row.createCell(colNum++).setCellValue(order.getId());
                row.createCell(colNum++).setCellValue(order.getOrderNumber());
                row.createCell(colNum++).setCellValue(product.getProductType().getName());
                row.createCell(colNum++).setCellValue(product.getFabric() != null ? product.getFabric().getName() : "");
                row.createCell(colNum++).setCellValue(product.getQuantity());
                
                Cell priceCell = row.createCell(colNum++);
                priceCell.setCellValue(product.getPrice().doubleValue());
                priceCell.setCellStyle(currencyStyle);
                
                row.createCell(colNum++).setCellValue(product.getDescription() != null ? product.getDescription() : "");
            }
        }
    }
    
    /**
     * Create header cell style
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    /**
     * Create date cell style
     */
    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-mm-dd"));
        return style;
    }
    
    /**
     * Create currency cell style
     */
    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0.00"));
        return style;
    }
    
    /**
     * Generate a filename for the Excel file based on filters
     */
    private String generateFilename(String status, String orderType, LocalDate startDate, LocalDate endDate) {
        StringBuilder filename = new StringBuilder("orders");
        
        if (orderType != null) {
            filename.append("_").append(orderType.toLowerCase());
        }
        
        if (status != null) {
            filename.append("_").append(status.toLowerCase());
        }
        
        if (startDate != null) {
            filename.append("_from_").append(startDate.format(DATE_FORMATTER));
        }
        
        if (endDate != null) {
            filename.append("_to_").append(endDate.format(DATE_FORMATTER));
        }
        
        filename.append(".xlsx");
        
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
