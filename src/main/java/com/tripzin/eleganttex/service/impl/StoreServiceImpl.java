package com.tripzin.eleganttex.service.impl;

import com.tripzin.eleganttex.dto.request.ManualStoreItemRequest;
import com.tripzin.eleganttex.dto.response.StoreItemResponse;
import com.tripzin.eleganttex.dto.response.StoreAdjustmentResponse;
import com.tripzin.eleganttex.dto.response.StoreStatisticsResponse;
import com.tripzin.eleganttex.entity.*;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.*;
import com.tripzin.eleganttex.service.StoreService;
import com.tripzin.eleganttex.service.mapper.StoreMapper;
import com.tripzin.eleganttex.util.SkuGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final StoreItemRepository storeItemRepository;
    private final StoreTransactionRepository storeTransactionRepository;
    private final StoreAdjustmentRepository storeAdjustmentRepository;
    private final StoreItemImageRepository storeItemImageRepository;
    private final UserRepository userRepository;
    private final FabricRepository fabricRepository;
    private final ProductTypeRepository productTypeRepository;
    private final OrderProductRepository orderProductRepository;
    private final StoreMapper storeMapper;
    
    private static final int AUTO_APPROVAL_THRESHOLD = 10;

    @Override
    @Transactional
    public void addProductsFromOrder(Order order, OrderStatus status, Long userId) {
        log.info("Adding products from order {} to store (via approvals). Status: {}, UserId: {}", 
            order.getOrderNumber(), status, userId);
        
        User user = getUserById(userId);
        
        StoreItemSource sourceType = (status == OrderStatus.RETURNED) 
            ? StoreItemSource.RETURNED_ORDER 
            : StoreItemSource.CANCELLED_ORDER;
        
        // Determine default quality based on status
        StoreItemQuality defaultQuality = (status == OrderStatus.CANCELLED) 
            ? StoreItemQuality.NEW  // Cancelled orders - items never used
            : StoreItemQuality.GOOD; // Returned orders - assume good condition
        
        for (OrderProduct orderProduct : order.getProducts()) {
            // Check if adjustment already exists for this order product (prevent duplicates)
            if (storeAdjustmentRepository.existsBySourceOrderProductId(orderProduct.getId())) {
                log.warn("Adjustment already exists for order product {}, skipping", orderProduct.getId());
                continue;
            }
            
            // Create pending adjustment for approval (auto-add items also require approval)
            StoreAdjustment adjustment = StoreAdjustment.builder()
                .storeItem(null) // Will be linked after approval
                .fabric(orderProduct.getFabric())
                .productType(orderProduct.getProductType())
                .requestedQuantity(orderProduct.getQuantity())
                .currentQuantity(0)
                .quality(defaultQuality)
                .adjustmentType(StoreAdjustmentType.AUTO_ADD)
                .status(StoreAdjustmentStatus.PENDING)
                .reason(String.format("%s order", status.getDisplayName()))
                .notes(String.format("Auto-added from %s order: %s", 
                    status.getDisplayName(), order.getOrderNumber()))
                .requestedBy(user)
                .requestedAt(LocalDateTime.now())
                .sourceOrderProductId(orderProduct.getId())
                .sourceOrderNumber(order.getOrderNumber())
                .originalPrice(orderProduct.getPrice())
                .sourceType(sourceType)
                .build();
            
            StoreAdjustment savedAdjustment = storeAdjustmentRepository.save(adjustment);
            log.info("Created pending adjustment {} for auto-add from order product {}", 
                savedAdjustment.getId(), orderProduct.getId());
        }
        
        log.info("Successfully created {} pending adjustments for order {}", 
            order.getProducts().size(), order.getOrderNumber());
    }

    @Override
    @Transactional
    public Long addManualItem(ManualStoreItemRequest request, Long userId) {
        log.info("Creating manual store item request by user {}", userId);
        
        User user = getUserById(userId);
        Fabric fabric = getFabricById(request.getFabricId());
        ProductType productType = getProductTypeById(request.getProductTypeId());
        StoreItemQuality quality = StoreItemQuality.fromString(request.getQuality());
        
        if (quality == null) {
            throw new IllegalArgumentException("Invalid quality: " + request.getQuality());
        }
        
        // Create adjustment request (pending approval)
        StoreAdjustment adjustment = StoreAdjustment.builder()
                .storeItem(null) // Will be linked after approval
                .fabric(fabric)
                .productType(productType)
                .requestedQuantity(request.getQuantity())
                .currentQuantity(0)
                .quality(quality)
                .adjustmentType(StoreAdjustmentType.MANUAL_ENTRY)
                .status(StoreAdjustmentStatus.PENDING)
                .reason(request.getReason())
                .notes(request.getNotes())
                .requestedBy(user)
                .requestedAt(LocalDateTime.now())
                .build();
        
        StoreAdjustment savedAdjustment = storeAdjustmentRepository.save(adjustment);
        log.info("Created pending adjustment {} for manual entry", savedAdjustment.getId());
        
        return savedAdjustment.getId();
    }

    @Override
    @Transactional
    public StoreItemResponse approveAdjustment(Long adjustmentId, Long userId) {
        log.info("Approving adjustment {} by user {}", adjustmentId, userId);
        
        StoreAdjustment adjustment = storeAdjustmentRepository.findById(adjustmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjustment not found with ID: " + adjustmentId));
        
        if (adjustment.getStatus() != StoreAdjustmentStatus.PENDING) {
            throw new IllegalStateException("Adjustment has already been reviewed");
        }
        
        User approver = getUserById(userId);
        Store mainWarehouse = getMainWarehouse();
        
        // Generate SKU
        String sku = SkuGenerator.generateSku(adjustment.getFabric(), adjustment.getProductType());
        
        // Ensure SKU is unique
        int attempt = 0;
        while (storeItemRepository.existsBySku(sku) && attempt < 10) {
            try {
                Thread.sleep(1); // Small delay to ensure different timestamp
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            sku = SkuGenerator.generateSku(adjustment.getFabric(), adjustment.getProductType());
            attempt++;
        }
        
        // Resolve style code from source order product if available
        String styleCode = null;
        if (adjustment.getSourceOrderProductId() != null) {
            orderProductRepository.findById(adjustment.getSourceOrderProductId())
                .ifPresent(op -> {
                    // use outer scope via array workaround not needed; we will set after fetch
                });
            var opOpt = orderProductRepository.findById(adjustment.getSourceOrderProductId());
            if (opOpt.isPresent()) {
                styleCode = opOpt.get().getStyleCode();
            }
        }
        // Create store item with source information from adjustment (for auto-adds)
        StoreItem storeItem = StoreItem.builder()
                .store(mainWarehouse)
                .sku(sku)
                .fabric(adjustment.getFabric())
                .productType(adjustment.getProductType())
                .styleCode(styleCode)
                .quantity(adjustment.getRequestedQuantity())
                .quality(adjustment.getQuality())
                .sourceType(adjustment.getSourceType() != null ? adjustment.getSourceType() : StoreItemSource.MANUAL_ENTRY)
                .sourceOrderProductId(adjustment.getSourceOrderProductId())
                .sourceOrderNumber(adjustment.getSourceOrderNumber())
                .originalPrice(adjustment.getOriginalPrice())
                .notes(adjustment.getNotes())
                .addedBy(adjustment.getRequestedBy())
                .build();
        
        StoreItem savedItem = storeItemRepository.save(storeItem);
        
        // Update adjustment
        adjustment.setStoreItem(savedItem);
        adjustment.setStatus(StoreAdjustmentStatus.APPROVED);
        adjustment.setApprovedBy(approver);
        adjustment.setReviewedAt(LocalDateTime.now());
        storeAdjustmentRepository.save(adjustment);
        
        // Create transaction
        StoreTransaction transaction = StoreTransaction.builder()
                .storeItem(savedItem)
                .transactionType(StoreTransactionType.RECEIVE)
                .quantity(adjustment.getRequestedQuantity())
                .qualityBefore(null)
                .qualityAfter(adjustment.getQuality())
                .performedBy(approver)
                .notes((adjustment.getAdjustmentType() == StoreAdjustmentType.AUTO_ADD 
                    ? "Auto-added: " + adjustment.getReason()
                    : "Manual entry") + ". " + adjustment.getNotes())
                .transactionDate(LocalDateTime.now())
                .build();
        
        storeTransactionRepository.save(transaction);
        
        // Copy images if this is an auto-add from order
        if (adjustment.getSourceOrderProductId() != null && adjustment.getAdjustmentType() == StoreAdjustmentType.AUTO_ADD) {
            // Find the original order product and copy images
            try {
                // Note: This requires access to OrderProductImageRepository and the actual images
                // For now, just log the intent. Images would be copied here if needed.
                log.debug("Images would be copied for store item {} from order product {}", 
                    savedItem.getId(), adjustment.getSourceOrderProductId());
            } catch (Exception e) {
                log.warn("Could not copy images for auto-added item: {}", e.getMessage());
            }
        }
        
        log.info("Approved adjustment {} and created store item {}", adjustmentId, savedItem.getId());
        
        return storeMapper.toResponse(savedItem);
    }

    @Override
    @Transactional
    public void rejectAdjustment(Long adjustmentId, Long userId, String reason) {
        log.info("Rejecting adjustment {} by user {}", adjustmentId, userId);
        
        StoreAdjustment adjustment = storeAdjustmentRepository.findById(adjustmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjustment not found with ID: " + adjustmentId));
        
        if (adjustment.getStatus() != StoreAdjustmentStatus.PENDING) {
            throw new IllegalStateException("Adjustment has already been reviewed");
        }
        
        User approver = getUserById(userId);
        
        adjustment.setStatus(StoreAdjustmentStatus.REJECTED);
        adjustment.setApprovedBy(approver);
        adjustment.setReviewedAt(LocalDateTime.now());
        adjustment.setNotes((adjustment.getNotes() != null ? adjustment.getNotes() + "\n" : "") 
            + "Rejection reason: " + reason);
        
        storeAdjustmentRepository.save(adjustment);
        
        log.info("Rejected adjustment {}", adjustmentId);
    }

    @Override
    @Transactional
    public StoreItemResponse updateItemQuality(Long itemId, StoreItemQuality newQuality, String notes, Long userId) {
        log.info("Updating quality of item {} to {} by user {}", itemId, newQuality, userId);
        
        StoreItem item = getStoreItemById(itemId);
        User user = getUserById(userId);
        StoreItemQuality oldQuality = item.getQuality();
        
        item.setQuality(newQuality);
        StoreItem savedItem = storeItemRepository.save(item);
        
        // Create transaction
        StoreTransaction transaction = StoreTransaction.builder()
                .storeItem(savedItem)
                .transactionType(StoreTransactionType.QUALITY_CHANGE)
                .quantity(0)
                .qualityBefore(oldQuality)
                .qualityAfter(newQuality)
                .performedBy(user)
                .notes(notes)
                .transactionDate(LocalDateTime.now())
                .build();
        
        storeTransactionRepository.save(transaction);
        
        return storeMapper.toResponse(savedItem);
    }

    @Override
    @Transactional
    public StoreItemResponse adjustQuantity(Long itemId, Integer quantityChange, String notes, Long userId) {
        log.info("Adjusting quantity of item {} by {} units", itemId, quantityChange);
        
        StoreItem item = getStoreItemById(itemId);
        User user = getUserById(userId);
        
        int newQuantity = item.getQuantity() + quantityChange;
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Resulting quantity cannot be negative");
        }
        
        item.setQuantity(newQuantity);
        StoreItem savedItem = storeItemRepository.save(item);
        
        // Create transaction
        StoreTransaction transaction = StoreTransaction.builder()
                .storeItem(savedItem)
                .transactionType(StoreTransactionType.ADJUST)
                .quantity(Math.abs(quantityChange))
                .qualityBefore(item.getQuality())
                .qualityAfter(item.getQuality())
                .performedBy(user)
                .notes(notes)
                .transactionDate(LocalDateTime.now())
                .build();
        
        storeTransactionRepository.save(transaction);
        
        return storeMapper.toResponse(savedItem);
    }

    @Override
    @Transactional
    public StoreItemResponse useItem(Long itemId, Integer quantity, String notes, Long userId) {
        log.info("Using {} units from item {}", quantity, itemId);
        
        StoreItem item = getStoreItemById(itemId);
        User user = getUserById(userId);
        
        if (item.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient quantity. Available: " + item.getQuantity());
        }
        
        item.setQuantity(item.getQuantity() - quantity);
        StoreItem savedItem = storeItemRepository.save(item);
        
        // Create transaction
        StoreTransaction transaction = StoreTransaction.builder()
                .storeItem(savedItem)
                .transactionType(StoreTransactionType.USE)
                .quantity(quantity)
                .qualityBefore(item.getQuality())
                .qualityAfter(item.getQuality())
                .performedBy(user)
                .notes(notes)
                .transactionDate(LocalDateTime.now())
                .build();
        
        storeTransactionRepository.save(transaction);
        
        return storeMapper.toResponse(savedItem);
    }

    @Override
    @Transactional
    public void writeOffItem(Long itemId, String notes, Long userId) {
        log.info("Writing off item {}", itemId);
        
        StoreItem item = getStoreItemById(itemId);
        User user = getUserById(userId);
        
        // Create transaction before marking as write-off
        StoreTransaction transaction = StoreTransaction.builder()
                .storeItem(item)
                .transactionType(StoreTransactionType.WRITE_OFF)
                .quantity(item.getQuantity())
                .qualityBefore(item.getQuality())
                .qualityAfter(StoreItemQuality.WRITE_OFF)
                .performedBy(user)
                .notes(notes)
                .transactionDate(LocalDateTime.now())
                .build();
        
        storeTransactionRepository.save(transaction);
        
        // Update item
        item.setQuality(StoreItemQuality.WRITE_OFF);
        item.setQuantity(0);
        storeItemRepository.save(item);
        
        log.info("Item {} written off", itemId);
    }

    @Override
    public StoreStatisticsResponse getStoreStatistics() {
        Long totalItems = storeItemRepository.count();
        Integer totalQuantity = storeItemRepository.findAll().stream()
                .mapToInt(StoreItem::getQuantity)
                .sum();
        Double totalValue = storeItemRepository.getTotalInventoryValue();
        Long itemsWithStock = storeItemRepository.findAllWithStock(org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
        
        Map<String, Long> countByQuality = new HashMap<>();
        for (StoreItemQuality quality : StoreItemQuality.values()) {
            countByQuality.put(quality.name(), storeItemRepository.countByQuality(quality));
        }
        
        Map<String, Long> countBySource = new HashMap<>();
        for (StoreItemSource source : StoreItemSource.values()) {
            long count = storeItemRepository.findBySourceType(source, org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
            countBySource.put(source.name(), count);
        }
        
        Long pendingApprovals = storeAdjustmentRepository.countPendingAdjustments();
        Long recentTransactions = storeTransactionRepository.count();
        
        return StoreStatisticsResponse.builder()
                .totalItems(totalItems)
                .totalQuantity(totalQuantity)
                .totalValue(totalValue != null ? totalValue : 0.0)
                .itemsWithStock(itemsWithStock)
                .countByQuality(countByQuality)
                .countBySource(countBySource)
                .pendingApprovals(pendingApprovals)
                .recentTransactions(recentTransactions)
                .build();
    }

    @Override
    public Map<String, Object> getAvailableItemsForProduct(Long fabricId, Long productTypeId) {
        List<StoreItem> items = storeItemRepository.findByFabricAndProductTypeWithStock(fabricId, productTypeId);
        Integer totalQuantity = items.stream().mapToInt(StoreItem::getQuantity).sum();
        
        Map<String, Object> result = new HashMap<>();
        result.put("availableItems", items.stream().map(storeMapper::toResponse).toList());
        result.put("totalQuantity", totalQuantity);
        
        return result;
    }

    @Override
    public org.springframework.data.domain.Page<StoreAdjustmentResponse> getAdjustments(StoreAdjustmentStatus status, org.springframework.data.domain.Pageable pageable) {
        return storeAdjustmentRepository.findByStatus(status, pageable)
                .map(storeMapper::toAdjustmentResponse);
    }
    
    // Helper methods
    
    private Store getMainWarehouse() {
        return storeRepository.findMainStore()
                .orElseThrow(() -> new ResourceNotFoundException("Main warehouse not found"));
    }
    
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }
    
    private Fabric getFabricById(Long fabricId) {
        return fabricRepository.findById(fabricId)
                .orElseThrow(() -> new ResourceNotFoundException("Fabric not found with ID: " + fabricId));
    }
    
    private ProductType getProductTypeById(Long productTypeId) {
        return productTypeRepository.findById(productTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Product type not found with ID: " + productTypeId));
    }
    
    private StoreItem getStoreItemById(Long itemId) {
        return storeItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Store item not found with ID: " + itemId));
    }
    
    private void copyOrderProductImages(OrderProduct orderProduct, StoreItem storeItem) {
        // Copy images from order product to store item
        if (orderProduct.getImages() != null && !orderProduct.getImages().isEmpty()) {
            for (var orderImage : orderProduct.getImages()) {
                StoreItemImage storeImage = StoreItemImage.builder()
                        .storeItem(storeItem)
                        .imageId(orderImage.getImageId())
                        .imageUrl(orderImage.getImageUrl())
                        .build();
                storeItemImageRepository.save(storeImage);
            }
            log.info("Copied {} images from order product {} to store item {}", 
                orderProduct.getImages().size(), orderProduct.getId(), storeItem.getId());
        }
    }
}
