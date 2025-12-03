package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.request.OrderProductRequest;
import com.tripzin.eleganttex.entity.Fabric;
import com.tripzin.eleganttex.entity.FileStorage;
import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderProduct;
import com.tripzin.eleganttex.entity.OrderProductImage;
import com.tripzin.eleganttex.entity.ProductType;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.FabricRepository;
import com.tripzin.eleganttex.repository.FileStorageRepository;
import com.tripzin.eleganttex.repository.OrderProductImageRepository;
import com.tripzin.eleganttex.repository.OrderProductRepository;
import com.tripzin.eleganttex.repository.ProductTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Component for handling order product operations
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderProductHandler {

    private final OrderProductRepository orderProductRepository;
    private final OrderProductImageRepository orderProductImageRepository;
    private final FabricRepository fabricRepository;
    private final ProductTypeRepository productTypeRepository;
    private final FileStorageRepository fileStorageRepository;
    private final FileStorageService fileStorageService;

    /**
     * Create a new order product from a request
     * @param productRequest The product request
     * @param order The parent order
     * @param files Optional files to attach to the product
     * @return The created order product
     */
    public OrderProduct createOrderProduct(OrderProductRequest productRequest, Order order, List<MultipartFile> files) {
        Fabric fabric = fabricRepository.findById(productRequest.getFabricId())
                .orElseThrow(() -> new ResourceNotFoundException("Fabric not found with ID: " + productRequest.getFabricId()));
        
        ProductType productType = productTypeRepository.findById(productRequest.getProductTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Product type not found with ID: " + productRequest.getProductTypeId()));
        
        OrderProduct product = OrderProduct.builder()
                .order(order)
                .productType(productType)
                .fabric(fabric)
                .quantity(productRequest.getQuantity())
                .price(productRequest.getPrice())
                .description(productRequest.getDescription())
            .styleCode(productRequest.getStyleCode())
                .build();
        
        OrderProduct savedProduct = orderProductRepository.save(product);
        
        // Handle existing images
        handleExistingImages(savedProduct, productRequest.getImageIds());
        
        // Handle new images from files
        handleNewImages(savedProduct, files);
        
        return savedProduct;
    }
    
    /**
     * Update an existing order product from a request
     * @param existingProduct The existing product to update
     * @param productRequest The product request with new data
     * @param files Optional files to attach to the product
     * @return The updated order product
     */
    public OrderProduct updateOrderProduct(OrderProduct existingProduct, OrderProductRequest productRequest, List<MultipartFile> files) {
        Fabric fabric = fabricRepository.findById(productRequest.getFabricId())
                .orElseThrow(() -> new ResourceNotFoundException("Fabric not found with ID: " + productRequest.getFabricId()));
        
        ProductType productType = productTypeRepository.findById(productRequest.getProductTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Product type not found with ID: " + productRequest.getProductTypeId()));
        
        existingProduct.setProductType(productType);
        existingProduct.setFabric(fabric);
        existingProduct.setQuantity(productRequest.getQuantity());
        existingProduct.setPrice(productRequest.getPrice());
        existingProduct.setDescription(productRequest.getDescription());
        existingProduct.setStyleCode(productRequest.getStyleCode());
        
        OrderProduct savedProduct = orderProductRepository.save(existingProduct);
        
        // Get existing images
        List<OrderProductImage> existingImages = orderProductImageRepository.findByOrderProductId(savedProduct.getId());
        Map<Long, OrderProductImage> existingImageMap = new HashMap<>();
        for (OrderProductImage existingImage : existingImages) {
            existingImageMap.put(existingImage.getImageId(), existingImage);
        }
        
        // Track images to keep
        Set<Long> imagesToKeep = new HashSet<>();
        
        // Handle existing images
        if (productRequest.getImageIds() != null && !productRequest.getImageIds().isEmpty()) {
            for (Long imageId : productRequest.getImageIds()) {
                // Check if image already exists for this product
                if (existingImageMap.containsKey(imageId)) {
                    // Keep existing image
                    imagesToKeep.add(imageId);
                } else {
                    // Verify image exists
                    fileStorageRepository.findById(imageId)
                            .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + imageId));
                    
                    // Create new image reference
                    OrderProductImage image = OrderProductImage.builder()
                            .orderProduct(savedProduct)
                            .imageId(imageId)
                            .imageUrl("/files/" + imageId)
                            .build();
                    
                    orderProductImageRepository.save(image);
                    imagesToKeep.add(imageId);
                }
            }
        }
        
        // Remove images that are no longer needed
        for (OrderProductImage existingImage : existingImages) {
            if (!imagesToKeep.contains(existingImage.getImageId())) {
                orderProductImageRepository.delete(existingImage);
            }
        }
        
        // Handle new images from files
        handleNewImages(savedProduct, files);
        
        return savedProduct;
    }
    
    /**
     * Delete an order product and its associated images
     * @param product The product to delete
     */
    public void deleteOrderProduct(OrderProduct product) {
        // First delete all images associated with this product
        List<OrderProductImage> images = orderProductImageRepository.findByOrderProductId(product.getId());
        for (OrderProductImage image : images) {
            orderProductImageRepository.delete(image);
        }
        
        // Then delete the product
        orderProductRepository.delete(product);
        
        log.info("Deleted product with ID: {}", product.getId());
    }
    
    /**
     * Handle existing images for a product
     * @param product The product
     * @param imageIds List of image IDs
     */
    private void handleExistingImages(OrderProduct product, List<Long> imageIds) {
        if (imageIds != null && !imageIds.isEmpty()) {
            for (Long imageId : imageIds) {
                // Verify image exists
                fileStorageRepository.findById(imageId)
                        .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + imageId));
                
                OrderProductImage image = OrderProductImage.builder()
                        .orderProduct(product)
                        .imageId(imageId)
                        .imageUrl("/files/" + imageId)
                        .build();
                
                orderProductImageRepository.save(image);
            }
        }
    }
    
    /**
     * Handle new images from files for a product
     * @param product The product
     * @param files List of files
     */
    private void handleNewImages(OrderProduct product, List<MultipartFile> files) {
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                try {
                    // Save image to file storage
                    FileStorage fileStorage = fileStorageService.storeFile(
                            file,
                            "ORDER_PRODUCT",
                            product.getId()
                    );
                    
                    // Create order product image
                    OrderProductImage image = OrderProductImage.builder()
                            .orderProduct(product)
                            .imageId(fileStorage.getId())
                            .imageUrl("/files/" + fileStorage.getId())
                            .build();
                    
                    orderProductImageRepository.save(image);
                } catch (Exception e) {
                    log.error("Error saving product image", e);
                    // Continue with other images
                }
            }
        }
    }
    
    /**
     * Copy images from one product to another
     * @param sourceProduct The source product to copy images from
     * @param targetProduct The target product to copy images to
     */
    public void copyProductImages(OrderProduct sourceProduct, OrderProduct targetProduct) {
        log.info("Copying images from product ID: {} to product ID: {}", sourceProduct.getId(), targetProduct.getId());
        
        // Get all images from the source product
        List<OrderProductImage> sourceImages = orderProductImageRepository.findByOrderProductId(sourceProduct.getId());
        
        if (sourceImages == null || sourceImages.isEmpty()) {
            log.info("No images to copy from product ID: {}", sourceProduct.getId());
            return;
        }
        
        // Copy each image to the target product
        for (OrderProductImage sourceImage : sourceImages) {
            try {
                // Create a new image reference for the target product
                OrderProductImage targetImage = OrderProductImage.builder()
                        .orderProduct(targetProduct)
                        .imageId(sourceImage.getImageId())
                        .imageUrl(sourceImage.getImageUrl())
                        .build();
                
                orderProductImageRepository.save(targetImage);
                log.info("Copied image ID: {} to product ID: {}", sourceImage.getImageId(), targetProduct.getId());
            } catch (Exception e) {
                log.error("Error copying image ID: {} to product ID: {}", sourceImage.getImageId(), targetProduct.getId(), e);
                // Continue with other images
            }
        }
    }
}
