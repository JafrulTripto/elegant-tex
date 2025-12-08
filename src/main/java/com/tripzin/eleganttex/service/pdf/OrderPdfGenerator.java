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
import com.tripzin.eleganttex.entity.*;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

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
     *
     * @param order The order entity with all its related data
     * @return ResponseEntity containing the PDF as a resource
     */
    public ResponseEntity<Resource> generateOrderPdf(Order order) {
        log.info("Generating PDF for order with ID: {}", order.getId());

        try {
            // Create PDF document with compact margins
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(10, 10, 10, 10); // Compact margins

            // Create fonts - using elegant Helvetica fonts for modern look
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont italicFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            // First page - Order details with product images
            createOrderDetailsPage(document, order, boldFont, regularFont, italicFont);

            // Close document
            document.close();

            // Return PDF as resource
            byte[] pdfBytes = baos.toByteArray();
            if (pdfBytes == null) {
                throw new RuntimeException("Failed to generate PDF bytes");
            }
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);

            MediaType pdfMediaType = MediaType.APPLICATION_PDF;
            if (pdfMediaType == null) {
                throw new RuntimeException("PDF media type not available");
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=order-" + order.getId() + ".pdf")
                    .contentType(pdfMediaType)
                    .contentLength(pdfBytes.length)
                    .body(resource);

        } catch (IOException e) {
            log.error("Error generating PDF for order with ID: {}", order.getId(), e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    // Define brand colors matching theme
    private final Color PRIMARY_COLOR = new DeviceRgb(185, 70, 126); // Magenta #B9467E
    private final Color SECONDARY_COLOR = new DeviceRgb(30, 41, 59); // Slate gray
    private final Color ACCENT_COLOR = new DeviceRgb(244, 143, 177); // Pink accent #F48FB1
    private final Color LIGHT_GRAY = new DeviceRgb(250, 250, 250); // Very light gray
    private final Color BORDER_COLOR = new DeviceRgb(230, 230, 230); // Light border

    /**
     * Get color based on order status
     *
     * @param status Order status
     * @return Color for the status
     */
    private Color getStatusColor(OrderStatus status) {
        if (status == null) {
            return ColorConstants.BLACK;
        }

        return switch (status) {
            case ORDER_CREATED, QA -> new DeviceRgb(243, 156, 18); // Orange
            case APPROVED, BOOKING, PRODUCTION -> new DeviceRgb(52, 152, 219); // Blue
            case READY -> new DeviceRgb(46, 204, 113); // Green
            case DELIVERED -> new DeviceRgb(39, 174, 96); // Dark Green
            case RETURNED, CANCELLED -> new DeviceRgb(231, 76, 60); // Red
            default -> ColorConstants.BLACK;
        };
    }

    /**
     * Creates the first page of the PDF with order details
     */
    private void createOrderDetailsPage(Document document, Order order, PdfFont boldFont, PdfFont regularFont, PdfFont italicFont) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // Add elegant header with gradient effect simulation
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 2, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(null)
                .setBackgroundColor(PRIMARY_COLOR)
                .setMarginBottom(4);

        try {

            // Logo cell with padding
            Cell logoCell = new Cell().setBorder(null).setPadding(6);

            // Load logo from resources
            // Use classpath to access the resource
            byte[] logoBytes = Objects.requireNonNull(getClass().getResourceAsStream("/static/images/eleganttexlogo.png")).readAllBytes();
            ImageData logoData = ImageDataFactory.create(logoBytes);
            Image logo = new Image(logoData);
            logo.setWidth(60); // Compact logo
            logoCell.add(logo);
            headerTable.addCell(logoCell);

            // Company name cell with white text on colored background
            Cell companyCell = new Cell().setBorder(null).setPadding(6)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE);
            Cell orderIdCell = new Cell().setBorder(null).setPadding(6)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE).setHorizontalAlignment(HorizontalAlignment.RIGHT);

            Paragraph companyName = new Paragraph("ELEGANT TEX")
                    .setFont(boldFont)
                    .setFontSize(18)
                    .setFontColor(ColorConstants.WHITE)
                    .setFixedLeading(20)
                    .setCharacterSpacing(1.2f);

            Paragraph tagline = new Paragraph("Quality Textile Solutions")
                    .setFont(italicFont)
                    .setFontSize(8)
                    .setFontColor(new DeviceRgb(240, 240, 240))
                    .setFixedLeading(10);
            
            Paragraph orderId = new Paragraph(order.getOrderNumber())
                    .setFont(boldFont)
                    .setFontSize(14)
                    .setFontColor(ColorConstants.WHITE)
                    .setFixedLeading(16);

            companyCell.add(companyName).add(tagline);
            headerTable.addCell(companyCell);
            orderIdCell.add(orderId);
            headerTable.addCell(orderIdCell);

            document.add(headerTable);

            // Add an accent divider
            Div divider = new Div().setWidth(UnitValue.createPercentValue(100))
                    .setHeight(2)
                    .setBackgroundColor(ACCENT_COLOR)
                    .setMarginBottom(5);
            document.add(divider);
        } catch (IOException e) {
            log.error("Error loading logo: {}", e.getMessage());
            // If logo loading fails, add elegant header without logo
            Table fallbackHeader = new Table(1)
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBorder(null)
                    .setBackgroundColor(PRIMARY_COLOR)
                    .setMarginBottom(8);
            
            Cell headerCell = new Cell().setBorder(null).setPadding(12);
            
            Paragraph companyName = new Paragraph("ELEGANT TEX")
                    .setFont(boldFont)
                    .setFontSize(18)
                    .setFontColor(ColorConstants.WHITE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFixedLeading(20)
                    .setCharacterSpacing(1.5f);
            
            Paragraph tagline = new Paragraph("Quality Textile Solutions")
                    .setFont(italicFont)
                    .setFontSize(8)
                    .setFontColor(new DeviceRgb(240, 240, 240))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFixedLeading(10);
            
            headerCell.add(companyName).add(tagline);
            fallbackHeader.addCell(headerCell);
            document.add(fallbackHeader);

            // Add accent divider
            Div divider = new Div().setWidth(UnitValue.createPercentValue(100))
                    .setHeight(3)
                    .setBackgroundColor(ACCENT_COLOR)
                    .setMarginBottom(10);
            document.add(divider);
        }

        // Order details with modern card design
        Table orderDetailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(5);

        // Left column - Company/Marketplace details with subtle border
        Cell leftCell = new Cell()
                .setBorder(new com.itextpdf.layout.borders.SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(6)
                .setBackgroundColor(LIGHT_GRAY);

        Paragraph fromHeader = new Paragraph("FROM")
                .setFont(boldFont)
                .setFontSize(9)
                .setFontColor(SECONDARY_COLOR)
                .setMarginBottom(3)
                .setCharacterSpacing(0.5f);
        leftCell.add(fromHeader);

        // Handle case where marketplace might be null (for MERCHANT type orders)
        // MERCHANT orders don't have a marketplace associated with them
        if (order.getMarketplace() != null) {
            // For MARKETPLACE orders
            leftCell.add(new Paragraph(order.getMarketplace().getName()).setFont(regularFont).setFontSize(8))
                    .add(new Paragraph(order.getMarketplace().getPageUrl()).setFont(regularFont).setFontSize(7));
        } else {
            // For MERCHANT orders
            leftCell.add(new Paragraph("Direct Merchant Order").setFont(regularFont).setFontSize(8));
            // Add merchant's name if available (from created by user)
            if (order.getCreatedBy() != null) {
                String creatorName = order.getCreatedBy().getFirstName() + " " + order.getCreatedBy().getLastName();
                leftCell.add(new Paragraph("Created by: " + creatorName).setFont(regularFont).setFontSize(7));
            }
        }

        // Right column - Order details with modern styling
        Cell rightCell = new Cell()
                .setBorder(new com.itextpdf.layout.borders.SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(6)
                .setBackgroundColor(LIGHT_GRAY);

        Paragraph orderHeader = new Paragraph("ORDER DETAILS")
                .setFont(boldFont)
                .setFontSize(9)
                .setFontColor(SECONDARY_COLOR)
                .setMarginBottom(3)
                .setCharacterSpacing(0.5f);

        // Make order number prominent
        Paragraph orderNumber = new Paragraph("#" + order.getOrderNumber())
                .setFont(boldFont)
                .setFontSize(11)
                .setFontColor(PRIMARY_COLOR)
                .setMarginBottom(2);

        rightCell.add(orderHeader)
                .add(orderNumber)
                .add(new Paragraph("Date: " + order.getCreatedAt().format(dateFormatter)).setFont(regularFont).setFontSize(8))
                .add(new Paragraph("Status: " + order.getStatus()).setFont(regularFont).setFontSize(8).setFontColor(getStatusColor(order.getStatus())))
                .add(new Paragraph("Delivery Date: " + order.getDeliveryDate().format(dateFormatter)).setFont(regularFont).setFontSize(8));

        orderDetailsTable.addCell(leftCell);
        orderDetailsTable.addCell(rightCell);
        document.add(orderDetailsTable);

        document.add(new Paragraph("").setMarginBottom(4)); // Smaller spacing

        // Create a combined table for customer and delivery info with card design
        Table combinedInfoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginTop(4)
                .setMarginBottom(5);

        Cell customerCell = new Cell()
                .setBorder(new com.itextpdf.layout.borders.SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(6)
                .setBackgroundColor(LIGHT_GRAY);

        Paragraph customerHeader = new Paragraph("CUSTOMER INFORMATION")
                .setFont(boldFont)
                .setFontSize(9)
                .setFontColor(SECONDARY_COLOR)
                .setMarginBottom(3)
                .setCharacterSpacing(0.5f);

        customerCell.add(customerHeader)
                .add(new Paragraph("Name: " + order.getCustomer().getName()).setFont(regularFont).setFontSize(8))
                .add(new Paragraph("Phone: " + order.getCustomer().getPhone()).setFont(regularFont).setFontSize(8));

        if (order.getCustomer().getAlternativePhone() != null && !order.getCustomer().getAlternativePhone().isEmpty()) {
            customerCell.add(new Paragraph("Alternative Phone: " + order.getCustomer().getAlternativePhone()).setFont(regularFont).setFontSize(8));
        }

        // Enhanced address formatting with geographical information
        String formattedAddress = formatCustomerAddress(order.getCustomer());
        customerCell.add(new Paragraph("Address: " + formattedAddress).setFont(regularFont).setFontSize(8));

        // Delivery details cell with card styling
        Cell deliveryCell = new Cell()
                .setBorder(new com.itextpdf.layout.borders.SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(6)
                .setBackgroundColor(LIGHT_GRAY);

        Paragraph deliveryHeader = new Paragraph("DELIVERY INFORMATION")
                .setFont(boldFont)
                .setFontSize(9)
                .setFontColor(SECONDARY_COLOR)
                .setMarginBottom(3)
                .setCharacterSpacing(0.5f);

        deliveryCell.add(deliveryHeader)
                .add(new Paragraph("Channel: " + order.getDeliveryChannel()).setFont(regularFont).setFontSize(8))
                .add(new Paragraph("Delivery Date: " + order.getDeliveryDate().format(dateFormatter)).setFont(regularFont).setFontSize(8));

        // Add both cells to the combined table
        combinedInfoTable.addCell(customerCell);
        combinedInfoTable.addCell(deliveryCell);
        document.add(combinedInfoTable);

        document.add(new Paragraph("").setMarginBottom(2)); // Compact spacing

        // Products table with elegant styling and description column
        Table productsTable = new Table(UnitValue.createPercentArray(new float[]{2.5f, 2f, 3f, 0.8f, 1.5f, 1.5f}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(5);

        // Table header with gradient-like effect
        Cell headerCell1 = new Cell().add(new Paragraph("PRODUCT").setFont(boldFont).setFontSize(7).setCharacterSpacing(0.5f))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4).setTextAlignment(TextAlignment.LEFT);
        Cell headerCell2 = new Cell().add(new Paragraph("FABRIC").setFont(boldFont).setFontSize(7).setCharacterSpacing(0.5f))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4).setTextAlignment(TextAlignment.LEFT);
        Cell headerCell3 = new Cell().add(new Paragraph("DESCRIPTION").setFont(boldFont).setFontSize(7).setCharacterSpacing(0.5f))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4).setTextAlignment(TextAlignment.LEFT);
        Cell headerCell4 = new Cell().add(new Paragraph("QTY").setFont(boldFont).setFontSize(7).setCharacterSpacing(0.5f))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4).setTextAlignment(TextAlignment.CENTER);
        Cell headerCell5 = new Cell().add(new Paragraph("PRICE").setFont(boldFont).setFontSize(7).setCharacterSpacing(0.5f))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4).setTextAlignment(TextAlignment.RIGHT);
        Cell headerCell6 = new Cell().add(new Paragraph("TOTAL").setFont(boldFont).setFontSize(7).setCharacterSpacing(0.5f))
                .setBackgroundColor(PRIMARY_COLOR).setFontColor(ColorConstants.WHITE)
                .setPadding(4).setTextAlignment(TextAlignment.RIGHT);

        productsTable.addHeaderCell(headerCell1);
        productsTable.addHeaderCell(headerCell2);
        productsTable.addHeaderCell(headerCell3);
        productsTable.addHeaderCell(headerCell4);
        productsTable.addHeaderCell(headerCell5);
        productsTable.addHeaderCell(headerCell6);

        // Table rows with improved styling and description
        boolean alternateRow = false;
        for (OrderProduct product : order.getProducts()) {
            Color rowColor = alternateRow ? LIGHT_GRAY : ColorConstants.WHITE;

            // Product name with style code if available
            String productName = product.getProductType().getName();
            if (product.getStyleCode() != null && !product.getStyleCode().trim().isEmpty()) {
                productName += "\n(" + product.getStyleCode() + ")";
            }
            Cell cell1 = new Cell().add(new Paragraph(productName).setFont(regularFont).setFontSize(7))
                    .setBackgroundColor(rowColor).setPadding(4).setTextAlignment(TextAlignment.LEFT);
            
            // Fabric with code if available
            String fabricInfo = product.getFabric().getName();
            if (product.getFabric().getFabricCode() != null && !product.getFabric().getFabricCode().trim().isEmpty()) {
                fabricInfo += "\n(" + product.getFabric().getFabricCode() + ")";
            }
            Cell cell2 = new Cell().add(new Paragraph(fabricInfo).setFont(regularFont).setFontSize(7))
                    .setBackgroundColor(rowColor).setPadding(4).setTextAlignment(TextAlignment.LEFT);
            
            // Description (new column)
            String description = (product.getDescription() != null && !product.getDescription().trim().isEmpty()) 
                    ? product.getDescription() 
                    : "-";
            Cell cell3 = new Cell().add(new Paragraph(description).setFont(regularFont).setFontSize(6).setItalic())
                    .setBackgroundColor(rowColor).setPadding(4).setTextAlignment(TextAlignment.LEFT)
                    .setFontColor(SECONDARY_COLOR);
            
            // Quantity
            Cell cell4 = new Cell().add(new Paragraph(String.valueOf(product.getQuantity())).setFont(boldFont).setFontSize(7))
                    .setBackgroundColor(rowColor).setPadding(4).setTextAlignment(TextAlignment.CENTER);
            
            // Unit price
            Cell cell5 = new Cell().add(new Paragraph("৳ " + product.getPrice().toString()).setFont(regularFont).setFontSize(7))
                    .setBackgroundColor(rowColor).setPadding(4).setTextAlignment(TextAlignment.RIGHT);

            // Subtotal
            BigDecimal subtotal = product.getPrice().multiply(new BigDecimal(product.getQuantity()));
            Cell cell6 = new Cell().add(new Paragraph("৳ " + subtotal.toString()).setFont(boldFont).setFontSize(7))
                    .setBackgroundColor(rowColor).setPadding(4).setTextAlignment(TextAlignment.RIGHT);

            productsTable.addCell(cell1);
            productsTable.addCell(cell2);
            productsTable.addCell(cell3);
            productsTable.addCell(cell4);
            productsTable.addCell(cell5);
            productsTable.addCell(cell6);

            // Toggle row color for next row
            alternateRow = !alternateRow;
        }

        document.add(productsTable);

        document.add(new Paragraph("").setMarginBottom(3));

        // Totals with elegant card design
        Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(LIGHT_GRAY)
                .setBorder(new com.itextpdf.layout.borders.SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(4);

        // Calculate total subtotal
        BigDecimal orderSubtotal = order.getProducts().stream()
                .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Subtotal:").setFont(regularFont).setFontSize(8).setTextAlignment(TextAlignment.RIGHT)).setPadding(2));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("৳ " + orderSubtotal.toString()).setFont(regularFont).setFontSize(8).setTextAlignment(TextAlignment.RIGHT)).setPadding(2));

        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Delivery Charge:").setFont(regularFont).setFontSize(8).setTextAlignment(TextAlignment.RIGHT)).setPadding(2));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("৳ " + order.getDeliveryCharge().toString()).setFont(regularFont).setFontSize(8).setTextAlignment(TextAlignment.RIGHT)).setPadding(2));

        // Total with accent background
        Cell totalLabelCell = new Cell().setBorder(null)
                .add(new Paragraph("TOTAL:").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.RIGHT).setCharacterSpacing(0.5f))
                .setPadding(3)
                .setBackgroundColor(PRIMARY_COLOR)
                .setFontColor(ColorConstants.WHITE);
        Cell totalValueCell = new Cell().setBorder(null)
                .add(new Paragraph("৳ " + order.getTotalAmount().toString()).setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.RIGHT))
                .setPadding(3)
                .setBackgroundColor(PRIMARY_COLOR)
                .setFontColor(ColorConstants.WHITE);
        
        totalsTable.addCell(totalLabelCell);
        totalsTable.addCell(totalValueCell);

        document.add(totalsTable);

        // Add product images starting from first page (8 images per page in 4x2 grid)
        addProductImagesGrid(document, order, boldFont, regularFont, true);
    }

    /**
     * Add product images in a 4x2 grid layout (8 images per page)
     * 
     * @param document The PDF document
     * @param order The order containing products and images
     * @param boldFont Bold font for headers
     * @param regularFont Regular font for captions
     * @param isFirstPage Whether this is being added to the first page
     */
    private void addProductImagesGrid(Document document, Order order, PdfFont boldFont, PdfFont regularFont, boolean isFirstPage) {
        // Collect all images from all products
        List<ProductImageInfo> allProductImages = new ArrayList<>();
        int productNumber = 1;
        
        for (OrderProduct product : order.getProducts()) {
            for (OrderProductImage orderImage : product.getImages()) {
                allProductImages.add(new ProductImageInfo(
                        productNumber,
                        orderImage,
                        product.getProductType().getName(),
                        product.getDescription(),
                        product.getFabric()
                ));
            }
            productNumber++;
        }

        if (allProductImages.isEmpty()) {
            return; // No images to display
        }

        int currentImageIndex = 0;
        
        while (currentImageIndex < allProductImages.size()) {
            // Add compact header for images section (only on first occurrence)
            if (currentImageIndex == 0) {
                document.add(new Paragraph("").setMarginBottom(isFirstPage ? 3 : 6));
                
                // Create header with decorative line
                Div headerLine = new Div().setWidth(UnitValue.createPercentValue(20))
                        .setHeight(1)
                        .setBackgroundColor(ACCENT_COLOR)
                        .setMarginBottom(2)
                        .setHorizontalAlignment(HorizontalAlignment.CENTER);
                document.add(headerLine);
                
                document.add(new Paragraph("PRODUCT IMAGES")
                        .setFont(boldFont)
                        .setFontSize(9)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontColor(PRIMARY_COLOR)
                        .setCharacterSpacing(1f)
                        .setMarginBottom(2));
                
                Div bottomLine = new Div().setWidth(UnitValue.createPercentValue(20))
                        .setHeight(1)
                        .setBackgroundColor(ACCENT_COLOR)
                        .setMarginBottom(3)
                        .setHorizontalAlignment(HorizontalAlignment.CENTER);
                document.add(bottomLine);
            }

            // Create a 4-column grid (4 images per row) - no captions
            Table imageGrid = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1, 1}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(4);

            // Add up to 4 images per row
            int imagesOnThisPage = Math.min(4, allProductImages.size() - currentImageIndex);
            
            for (int col = 0; col < 4; col++) {
                int imageIndex = currentImageIndex + col;
                
                Cell imageCell = new Cell()
                        .setBorder(null)
                        .setPadding(3) // Spacing around images
                        .setTextAlignment(TextAlignment.CENTER);

                if (imageIndex < allProductImages.size() && imageIndex < currentImageIndex + imagesOnThisPage) {
                    ProductImageInfo imageInfo = allProductImages.get(imageIndex);
                    
                    try {
                        // Get image data from storage
                        Long imageId = imageInfo.orderImage.getImageId();
                        if (imageId == null) {
                            throw new ResourceNotFoundException("Image ID is null");
                        }
                        FileStorage fileStorage = fileStorageRepository.findById(imageId)
                                .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + imageId));

                        byte[] imageData;
                        if (fileStorageConfig.isUseS3Storage()) {
                            imageData = s3Service.downloadFile(fileStorage.getFilePath());
                        } else {
                            java.nio.file.Path imagePath = fileStorageConfig.getUploadPath()
                                    .resolve(fileStorage.getFilePath());
                            imageData = java.nio.file.Files.readAllBytes(imagePath);
                        }

                        // Create image
                        ImageData data = ImageDataFactory.create(imageData);
                        Image img = new Image(data);

                        // Larger image size for 4 per row (no captions)
                        float maxWidth = 140;
                        float maxHeight = 140;

                        float imgWidth = img.getImageWidth();
                        float imgHeight = img.getImageHeight();
                        float widthRatio = maxWidth / imgWidth;
                        float heightRatio = maxHeight / imgHeight;
                        float scaleFactor = Math.min(widthRatio, heightRatio);

                        img.scale(scaleFactor, scaleFactor);
                        img.setHorizontalAlignment(HorizontalAlignment.CENTER);

                        imageCell.add(img);
                        // No caption - just the image

                    } catch (Exception e) {
                        log.error("Error adding image to PDF grid: {}", e.getMessage());
                        imageCell.add(new Paragraph("Image\nnot available")
                                .setFontColor(ColorConstants.GRAY)
                                .setFontSize(6)
                                .setTextAlignment(TextAlignment.CENTER));
                    }
                } else {
                    // Empty cell for remaining slots
                    imageCell.add(new Paragraph(""));
                }

                imageGrid.addCell(imageCell);
            }

            document.add(imageGrid);
            currentImageIndex += imagesOnThisPage;

            // Add page break if there are more images and we're not on the last batch
            if (currentImageIndex < allProductImages.size()) {
                document.add(new AreaBreak());
                isFirstPage = false; // Subsequent pages are not first page
            }
        }
    }

    /**
     * Helper class to store product image information
     */
    private record ProductImageInfo(int productNumber,OrderProductImage orderImage, String productType, String description,
                                    Fabric fabric) {
    }

    /**
     * Format customer address with geographical information when available
     *
     * @param customer The customer entity
     * @return Formatted address string
     */
    private String formatCustomerAddress(com.tripzin.eleganttex.entity.Customer customer) {
        // Use the helper method from Customer entity which handles both new and legacy addresses
        String displayAddress = customer.getDisplayAddress();

        // If we have a geographical address, enhance it with postal code
        if (customer.getAddress() != null) {
            StringBuilder enhancedAddress = new StringBuilder(customer.getAddress().getFormattedAddress());

            // Add postal code if available
            if (customer.getAddress().getPostalCode() != null && !customer.getAddress().getPostalCode().trim().isEmpty()) {
                enhancedAddress.append(", ").append(customer.getAddress().getPostalCode().trim());
            }

            return enhancedAddress.toString();
        }

        // Fall back to display address (which handles legacy addresses)
        return displayAddress != null ? displayAddress : "Address not available";
    }
}
