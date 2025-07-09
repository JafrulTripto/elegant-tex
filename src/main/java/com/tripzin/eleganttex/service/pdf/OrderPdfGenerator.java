package com.tripzin.eleganttex.service.pdf;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Div;
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
import com.tripzin.eleganttex.entity.OrderStatus;
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
            document.setMargins(28, 28, 28, 28); // Reduced margins for more compact layout
            
            // Create fonts - using more elegant fonts
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.TIMES_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.TIMES_ROMAN);
            PdfFont italicFont = PdfFontFactory.createFont(StandardFonts.TIMES_ITALIC);
            
            // First page - Order details
            createOrderDetailsPage(document, order, boldFont, regularFont, italicFont);
            
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
    
    // Define brand colors
    private final Color PRIMARY_COLOR = new DeviceRgb(41, 128, 185); // Blue
    private final Color SECONDARY_COLOR = new DeviceRgb(52, 73, 94); // Dark blue-gray
    private final Color LIGHT_GRAY = new DeviceRgb(236, 240, 241); // Light gray for backgrounds
    
    /**
     * Get color based on order status
     * @param status Order status
     * @return Color for the status
     */
    private Color getStatusColor(OrderStatus status) {
        if (status == null) {
            return ColorConstants.BLACK;
        }
        
        switch (status) {
            case ORDER_CREATED:
                return new DeviceRgb(243, 156, 18); // Orange
            case APPROVED:
                return new DeviceRgb(52, 152, 219); // Blue
            case BOOKING:
                return new DeviceRgb(52, 152, 219); // Blue
            case PRODUCTION:
                return new DeviceRgb(52, 152, 219); // Blue
            case QA:
                return new DeviceRgb(243, 156, 18); // Orange
            case READY:
                return new DeviceRgb(46, 204, 113); // Green
            case DELIVERED:
                return new DeviceRgb(39, 174, 96); // Dark Green
            case RETURNED:
                return new DeviceRgb(231, 76, 60); // Red
            case CANCELLED:
                return new DeviceRgb(231, 76, 60); // Red
            default:
                return ColorConstants.BLACK;
        }
    }
    
    /**
     * Creates the first page of the PDF with order details
     */
    private void createOrderDetailsPage(Document document, Order order, PdfFont boldFont, PdfFont regularFont, PdfFont italicFont) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        // Add company logo and name in header
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(null);
        
        try {
            
            // Logo cell
            Cell logoCell = new Cell().setBorder(null).setPadding(3);
            
            // Load logo from resources
            // Use classpath to access the resource
            byte[] logoBytes = getClass().getResourceAsStream("/static/images/eleganttexlogo.png").readAllBytes();
            ImageData logoData = ImageDataFactory.create(logoBytes);
            Image logo = new Image(logoData);
            logo.setWidth(80); // Reduced logo width for more compact layout
            logoCell.add(logo);
            headerTable.addCell(logoCell);
            
            // Company name cell
            Cell companyCell = new Cell().setBorder(null).setPadding(3)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE);
            
            Paragraph companyName = new Paragraph("Elegant tex")
                    .setFont(boldFont)
                    .setFontSize(22) // Slightly smaller for compactness
                    .setFontColor(PRIMARY_COLOR)
                    .setFixedLeading(24); // Control line height
            
            Paragraph tagline = new Paragraph("Quality Textile Solutions")
                    .setFont(italicFont) // Using italic for the tagline
                    .setFontSize(11)
                    .setFontColor(SECONDARY_COLOR)
                    .setFixedLeading(13); // Control line height
            
            companyCell.add(companyName).add(tagline);
            headerTable.addCell(companyCell);
            
            document.add(headerTable);
            
            // Add a divider
            Div divider = new Div().setWidth(UnitValue.createPercentValue(100))
                    .setHeight(1) // Thinner divider
                    .setBackgroundColor(PRIMARY_COLOR)
                    .setMarginTop(3)
                    .setMarginBottom(8); // Reduced spacing
            document.add(divider);
        } catch (IOException e) {
            log.error("Error loading logo: {}", e.getMessage());
            // If logo loading fails, just add company name without logo
            Paragraph companyName = new Paragraph("Elegant tex")
                    .setFont(boldFont)
                    .setFontSize(22) // Slightly smaller
                    .setFontColor(PRIMARY_COLOR)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFixedLeading(24); // Control line height
            document.add(companyName);
            
            Paragraph tagline = new Paragraph("Quality Textile Solutions")
                    .setFont(italicFont) // Using italic for the tagline
                    .setFontSize(11)
                    .setFontColor(SECONDARY_COLOR)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFixedLeading(13); // Control line height
            document.add(tagline);
            
            // Add a divider
            Div divider = new Div().setWidth(UnitValue.createPercentValue(100))
                    .setHeight(1) // Thinner divider
                    .setBackgroundColor(PRIMARY_COLOR)
                    .setMarginTop(3)
                    .setMarginBottom(8); // Reduced spacing
            document.add(divider);
        }
        
        // Order details
        Table orderDetailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(6); // Reduced margin
        
        // Left column - Company/Marketplace details
        Cell leftCell = new Cell()
                .setBorder(null)
                .setPadding(6) // Reduced padding
                .setBackgroundColor(LIGHT_GRAY);
        
        Paragraph fromHeader = new Paragraph("From:")
                .setFont(boldFont)
                .setFontColor(PRIMARY_COLOR)
                .setMarginBottom(3) // Reduced margin
                .setFixedLeading(14); // Control line height
        leftCell.add(fromHeader);
        
        // Handle case where marketplace might be null (for MERCHANT type orders)
        // MERCHANT orders don't have a marketplace associated with them
        if (order.getMarketplace() != null) {
            // For MARKETPLACE orders
            leftCell.add(new Paragraph(order.getMarketplace().getName()).setFont(regularFont))
                  .add(new Paragraph(order.getMarketplace().getPageUrl()).setFont(regularFont));
        } else {
            // For MERCHANT orders
            leftCell.add(new Paragraph("Direct Merchant Order").setFont(regularFont));
            // Add merchant's name if available (from created by user)
            if (order.getCreatedBy() != null) {
                String creatorName = order.getCreatedBy().getFirstName() + " " + order.getCreatedBy().getLastName();
                leftCell.add(new Paragraph("Created by: " + creatorName).setFont(regularFont));
            }
        }
        
        // Right column - Order details
        Cell rightCell = new Cell()
                .setBorder(null)
                .setPadding(6) // Reduced padding
                .setBackgroundColor(LIGHT_GRAY);
        
        Paragraph orderHeader = new Paragraph("Order Details:")
                .setFont(boldFont)
                .setFontColor(PRIMARY_COLOR)
                .setMarginBottom(3) // Reduced margin
                .setFixedLeading(14); // Control line height
        
        rightCell.add(orderHeader)
                .add(new Paragraph("Order #: " + order.getOrderNumber()).setFont(regularFont))
                .add(new Paragraph("Date: " + order.getCreatedAt().format(dateFormatter)).setFont(regularFont))
                .add(new Paragraph("Status: " + order.getStatus()).setFont(regularFont).setFontColor(getStatusColor(order.getStatus())))
                .add(new Paragraph("Delivery Date: " + order.getDeliveryDate().format(dateFormatter)).setFont(regularFont));
        
        orderDetailsTable.addCell(leftCell);
        orderDetailsTable.addCell(rightCell);
        document.add(orderDetailsTable);
        
        document.add(new Paragraph("").setMarginBottom(4)); // Smaller spacing
        
        // Create a combined table for customer and delivery info (side by side)
        Table combinedInfoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginTop(4)
                .setMarginBottom(6);
        
        Cell customerCell = new Cell()
                .setBorder(null)
                .setPadding(6) // Reduced padding
                .setBackgroundColor(LIGHT_GRAY);
        
        Paragraph customerHeader = new Paragraph("Customer Information:")
                .setFont(boldFont)
                .setFontColor(PRIMARY_COLOR)
                .setMarginBottom(3) // Reduced margin
                .setFixedLeading(14); // Control line height
        
        customerCell.add(customerHeader)
                .add(new Paragraph("Name: " + order.getCustomer().getName()).setFont(regularFont))
                .add(new Paragraph("Phone: " + order.getCustomer().getPhone()).setFont(regularFont));
        
        if (order.getCustomer().getAlternativePhone() != null && !order.getCustomer().getAlternativePhone().isEmpty()) {
            customerCell.add(new Paragraph("Alternative Phone: " + order.getCustomer().getAlternativePhone()).setFont(regularFont));
        }
        
        customerCell.add(new Paragraph("Address: " + order.getCustomer().getAddress()).setFont(regularFont));
        
        if (order.getCustomer().getFacebookId() != null && !order.getCustomer().getFacebookId().isEmpty()) {
            customerCell.add(new Paragraph("Facebook: " + order.getCustomer().getFacebookId()).setFont(regularFont));
        }
        
        // Delivery details cell (will be placed next to customer cell)
        Cell deliveryCell = new Cell()
                .setBorder(null)
                .setPadding(6) // Reduced padding
                .setBackgroundColor(LIGHT_GRAY);
        
        Paragraph deliveryHeader = new Paragraph("Delivery Information:")
                .setFont(boldFont)
                .setFontColor(PRIMARY_COLOR)
                .setMarginBottom(3) // Reduced margin
                .setFixedLeading(14); // Control line height
        
        deliveryCell.add(deliveryHeader)
                .add(new Paragraph("Channel: " + order.getDeliveryChannel()).setFont(regularFont))
                .add(new Paragraph("Delivery Date: " + order.getDeliveryDate().format(dateFormatter)).setFont(regularFont));
        
        // Add both cells to the combined table
        combinedInfoTable.addCell(customerCell);
        combinedInfoTable.addCell(deliveryCell);
        document.add(combinedInfoTable);
        
        document.add(new Paragraph("").setMarginBottom(4)); // Smaller spacing
        
        // Products table
        Table productsTable = new Table(UnitValue.createPercentArray(new float[]{3, 2, 1, 2, 2}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(6); // Reduced margin
        
        // Table header
        Cell headerCell1 = new Cell().add(new Paragraph("Product").setFont(boldFont))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4); // Reduced padding
        Cell headerCell2 = new Cell().add(new Paragraph("Fabric").setFont(boldFont))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4); // Reduced padding
        Cell headerCell3 = new Cell().add(new Paragraph("Qty").setFont(boldFont))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4); // Reduced padding
        Cell headerCell4 = new Cell().add(new Paragraph("Unit Price").setFont(boldFont))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4); // Reduced padding
        Cell headerCell5 = new Cell().add(new Paragraph("Subtotal").setFont(boldFont))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4); // Reduced padding
        
        productsTable.addHeaderCell(headerCell1);
        productsTable.addHeaderCell(headerCell2);
        productsTable.addHeaderCell(headerCell3);
        productsTable.addHeaderCell(headerCell4);
        productsTable.addHeaderCell(headerCell5);
        
        // Table rows
        boolean alternateRow = false;
        for (OrderProduct product : order.getProducts()) {
            Color rowColor = alternateRow ? LIGHT_GRAY : ColorConstants.WHITE;
            
            Cell cell1 = new Cell().add(new Paragraph(product.getProductType()).setFont(regularFont))
                    .setBackgroundColor(rowColor).setPadding(4); // Reduced padding
            Cell cell2 = new Cell().add(new Paragraph(product.getFabric().getName()).setFont(regularFont))
                    .setBackgroundColor(rowColor).setPadding(4); // Reduced padding
            Cell cell3 = new Cell().add(new Paragraph(String.valueOf(product.getQuantity())).setFont(regularFont))
                    .setBackgroundColor(rowColor).setPadding(4); // Reduced padding
            Cell cell4 = new Cell().add(new Paragraph(product.getPrice().toString()).setFont(regularFont))
                    .setBackgroundColor(rowColor).setPadding(4); // Reduced padding
            
            BigDecimal subtotal = product.getPrice().multiply(new BigDecimal(product.getQuantity()));
            Cell cell5 = new Cell().add(new Paragraph(subtotal.toString()).setFont(regularFont))
                    .setBackgroundColor(rowColor).setPadding(4); // Reduced padding
            
            productsTable.addCell(cell1);
            productsTable.addCell(cell2);
            productsTable.addCell(cell3);
            productsTable.addCell(cell4);
            productsTable.addCell(cell5);
            
            // Toggle row color for next row
            alternateRow = !alternateRow;
        }
        
        document.add(productsTable);
        
        document.add(new Paragraph("").setMarginBottom(4)); // Smaller spacing
        
        // Totals
        Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{4, 1}))
                .setWidth(UnitValue.createPercentValue(100));
        
        // Calculate total subtotal
        BigDecimal orderSubtotal = order.getProducts().stream()
                .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Subtotal:").setFont(boldFont).setTextAlignment(TextAlignment.RIGHT)));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(orderSubtotal.toString()).setFont(regularFont)));
        
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
