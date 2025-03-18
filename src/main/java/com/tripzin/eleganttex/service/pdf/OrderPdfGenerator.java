package com.tripzin.eleganttex.service.pdf;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.tripzin.eleganttex.config.FileStorageConfig;
import com.tripzin.eleganttex.entity.FileStorage;
import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderProduct;
import com.tripzin.eleganttex.entity.OrderProductImage;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.FileStorageRepository;
import com.tripzin.eleganttex.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Component for generating PDF documents for orders
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderPdfGenerator {

    private final FileStorageRepository fileStorageRepository;
    private final FileStorageConfig fileStorageConfig;
    private final S3Service s3Service;

    /**
     * Generate a PDF document for an order
     * @param order The order entity with all its related data
     * @return ResponseEntity containing the PDF as a resource
     */
    public ResponseEntity<Resource> generateOrderPdf(Order order) {
        log.info("Generating PDF for order with ID: {}", order.getId());
        
        try {
            // Create PDF document
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(36, 36, 36, 36); // 0.5 inch margins
            
            // Create fonts
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            
            // First page - Invoice details
            createInvoicePage(document, order, boldFont, regularFont);
            
            // Second page - Product images
            List<OrderProductImage> allImages = getAllProductImages(order);
            if (!allImages.isEmpty()) {
                // Add a new page for images
                document.add(new Paragraph("\n"));
                document.add(new Paragraph("Product Images").setFont(boldFont).setFontSize(14)
                        .setTextAlignment(TextAlignment.CENTER));
                document.add(new Paragraph("\n"));
                
                createImagesPage(document, allImages);
            }
            
            // Close document
            document.close();
            
            // Return PDF as resource
            byte[] pdfBytes = baos.toByteArray();
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=order-" + order.getId() + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(resource);
            
        } catch (IOException e) {
            log.error("Error generating PDF for order with ID: {}", order.getId(), e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
    
    /**
     * Collect all product images from an order
     * @param order The order entity
     * @return List of all product images
     */
    private List<OrderProductImage> getAllProductImages(Order order) {
        return order.getProducts().stream()
                .flatMap(product -> product.getImages().stream())
                .toList();
    }
    
    /**
     * Creates the first page of the PDF with invoice-like details
     */
    private void createInvoicePage(Document document, Order order, PdfFont boldFont, PdfFont regularFont) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        // Header
        Paragraph header = new Paragraph("INVOICE")
                .setFont(boldFont)
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(header);
        
        // Order details
        Table orderDetailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        // Left column - Company/Marketplace details
        Cell leftCell = new Cell()
                .setBorder(null)
                .add(new Paragraph("From:").setFont(boldFont))
                .add(new Paragraph(order.getMarketplace().getName()).setFont(regularFont))
                .add(new Paragraph(order.getMarketplace().getPageUrl()).setFont(regularFont));
        
        // Right column - Order details
        Cell rightCell = new Cell()
                .setBorder(null)
                .add(new Paragraph("Order Details:").setFont(boldFont))
                .add(new Paragraph("Order #: " + order.getOrderNumber()).setFont(regularFont))
                .add(new Paragraph("Date: " + order.getCreatedAt().format(dateFormatter)).setFont(regularFont))
                .add(new Paragraph("Status: " + order.getStatus()).setFont(regularFont))
                .add(new Paragraph("Delivery Date: " + order.getDeliveryDate().format(dateFormatter)).setFont(regularFont));
        
        orderDetailsTable.addCell(leftCell);
        orderDetailsTable.addCell(rightCell);
        document.add(orderDetailsTable);
        
        document.add(new Paragraph("\n"));
        
        // Customer details
        Table customerTable = new Table(UnitValue.createPercentArray(new float[]{1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        Cell customerCell = new Cell()
                .setBorder(null)
                .add(new Paragraph("Customer Information:").setFont(boldFont))
                .add(new Paragraph("Name: " + order.getCustomer().getName()).setFont(regularFont))
                .add(new Paragraph("Phone: " + order.getCustomer().getPhone()).setFont(regularFont));
        
        if (order.getCustomer().getAlternativePhone() != null && !order.getCustomer().getAlternativePhone().isEmpty()) {
            customerCell.add(new Paragraph("Alternative Phone: " + order.getCustomer().getAlternativePhone()).setFont(regularFont));
        }
        
        customerCell.add(new Paragraph("Address: " + order.getCustomer().getAddress()).setFont(regularFont));
        
        if (order.getCustomer().getFacebookId() != null && !order.getCustomer().getFacebookId().isEmpty()) {
            customerCell.add(new Paragraph("Facebook: " + order.getCustomer().getFacebookId()).setFont(regularFont));
        }
        
        customerTable.addCell(customerCell);
        document.add(customerTable);
        
        document.add(new Paragraph("\n"));
        
        // Delivery details
        Table deliveryTable = new Table(UnitValue.createPercentArray(new float[]{1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        Cell deliveryCell = new Cell()
                .setBorder(null)
                .add(new Paragraph("Delivery Information:").setFont(boldFont))
                .add(new Paragraph("Channel: " + order.getDeliveryChannel()).setFont(regularFont))
                .add(new Paragraph("Delivery Date: " + order.getDeliveryDate().format(dateFormatter)).setFont(regularFont));
        
        deliveryTable.addCell(deliveryCell);
        document.add(deliveryTable);
        
        document.add(new Paragraph("\n"));
        
        // Products table
        Table productsTable = new Table(UnitValue.createPercentArray(new float[]{3, 2, 1, 2, 2}))
                .setWidth(UnitValue.createPercentValue(100));
        
        // Table header
        productsTable.addHeaderCell(new Cell().add(new Paragraph("Product").setFont(boldFont)));
        productsTable.addHeaderCell(new Cell().add(new Paragraph("Fabric").setFont(boldFont)));
        productsTable.addHeaderCell(new Cell().add(new Paragraph("Qty").setFont(boldFont)));
        productsTable.addHeaderCell(new Cell().add(new Paragraph("Unit Price").setFont(boldFont)));
        productsTable.addHeaderCell(new Cell().add(new Paragraph("Subtotal").setFont(boldFont)));
        
        // Table rows
        for (OrderProduct product : order.getProducts()) {
            productsTable.addCell(new Cell().add(new Paragraph(product.getProductType()).setFont(regularFont)));
            productsTable.addCell(new Cell().add(new Paragraph(product.getFabric().getName()).setFont(regularFont)));
            productsTable.addCell(new Cell().add(new Paragraph(String.valueOf(product.getQuantity())).setFont(regularFont)));
            productsTable.addCell(new Cell().add(new Paragraph(product.getPrice().toString()).setFont(regularFont)));
            
            BigDecimal subtotal = product.getPrice().multiply(new BigDecimal(product.getQuantity()));
            productsTable.addCell(new Cell().add(new Paragraph(subtotal.toString()).setFont(regularFont)));
        }
        
        document.add(productsTable);
        
        document.add(new Paragraph("\n"));
        
        // Totals
        Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{4, 1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        // Calculate subtotal
        BigDecimal subtotal = order.getProducts().stream()
                .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Subtotal:").setFont(boldFont).setTextAlignment(TextAlignment.RIGHT)));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(subtotal.toString()).setFont(regularFont)));
        
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Delivery Charge:").setFont(boldFont).setTextAlignment(TextAlignment.RIGHT)));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(order.getDeliveryCharge().toString()).setFont(regularFont)));
        
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Total:").setFont(boldFont).setTextAlignment(TextAlignment.RIGHT)));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(order.getTotalAmount().toString()).setFont(boldFont)));
        
        document.add(totalsTable);
        
        // Add page break for images
        document.add(new AreaBreak());
    }
    
    /**
     * Creates the second page with product images in a grid layout
     */
    private void createImagesPage(Document document, List<OrderProductImage> images) throws IOException {
        // Create a table for the image grid
        // We'll use 2 columns for the grid
        Table imageTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        // Calculate how many images we can fit on the page
        // For simplicity, we'll limit to a maximum of 6 images (3 rows x 2 columns)
        int maxImages = Math.min(images.size(), 6);
        
        for (int i = 0; i < maxImages; i++) {
            OrderProductImage orderImage = images.get(i);
            
            try {
                // Get image data from storage
                FileStorage fileStorage = fileStorageRepository.findById(orderImage.getImageId())
                        .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + orderImage.getImageId()));
                
                byte[] imageData;
                if (fileStorageConfig.isUseS3Storage()) {
                    // Get from S3
                    imageData = s3Service.downloadFile(fileStorage.getFilePath());
                } else {
                    // Get from local storage
                    java.nio.file.Path imagePath = fileStorageConfig.getUploadPath()
                            .resolve(fileStorage.getFilePath());
                    imageData = java.nio.file.Files.readAllBytes(imagePath);
                }
                
                // Create image
                ImageData data = ImageDataFactory.create(imageData);
                Image img = new Image(data);
                
                // Scale image to fit in cell while maintaining aspect ratio
                float maxWidth = 250; // Max width for the image in the cell
                float maxHeight = 250; // Max height for the image in the cell
                
                // Calculate scaling factor to maintain aspect ratio
                float imgWidth = img.getImageWidth();
                float imgHeight = img.getImageHeight();
                float widthRatio = maxWidth / imgWidth;
                float heightRatio = maxHeight / imgHeight;
                float scaleFactor = Math.min(widthRatio, heightRatio);
                
                // Scale image
                img.scale(scaleFactor, scaleFactor);
                
                // Center image in cell
                Cell cell = new Cell()
                        .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 1))
                        .setPadding(10)
                        .setHorizontalAlignment(HorizontalAlignment.CENTER)
                        .setVerticalAlignment(VerticalAlignment.MIDDLE)
                        .add(img);
                
                imageTable.addCell(cell);
            } catch (Exception e) {
                log.error("Error adding image to PDF: {}", e.getMessage());
                // Add empty cell if image can't be loaded
                Cell cell = new Cell()
                        .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 1))
                        .setPadding(10)
                        .add(new Paragraph("Image not available").setFontColor(ColorConstants.GRAY));
                imageTable.addCell(cell);
            }
        }
        
        // If we have an odd number of images, add an empty cell to complete the grid
        if (maxImages % 2 != 0) {
            Cell cell = new Cell().setBorder(null);
            imageTable.addCell(cell);
        }
        
        document.add(imageTable);
    }
}
