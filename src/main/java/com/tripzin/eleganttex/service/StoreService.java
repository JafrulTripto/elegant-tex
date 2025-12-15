package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.request.ManualStoreItemRequest;
import com.tripzin.eleganttex.dto.response.StoreItemResponse;
import com.tripzin.eleganttex.dto.response.StoreStatisticsResponse;
import com.tripzin.eleganttex.dto.response.StoreAdjustmentResponse;
import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderStatus;
import com.tripzin.eleganttex.entity.StoreItemQuality;
import com.tripzin.eleganttex.entity.StoreAdjustmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

/**
 * Service interface for store operations
 */
public interface StoreService {
    
    /**
     * Automatically add products from an order to the store
     * Called when order status changes to RETURNED or CANCELLED
     * 
     * @param order the order containing products to add
     * @param status the new status (RETURNED or CANCELLED)
     * @param userId the user performing the action
     */
    void addProductsFromOrder(Order order, OrderStatus status, Long userId);
    
    /**
     * Add a manual store item (creates pending adjustment for approval)
     * 
     * @param request the manual item request
     * @param userId the user creating the request
     * @return the created adjustment ID
     */
    Long addManualItem(ManualStoreItemRequest request, Long userId);
    
    /**
     * Approve a pending adjustment
     * 
     * @param adjustmentId the adjustment to approve
     * @param userId the user approving
     * @return the created or updated store item
     */
    StoreItemResponse approveAdjustment(Long adjustmentId, Long userId);
    
    /**
     * Reject a pending adjustment
     * 
     * @param adjustmentId the adjustment to reject
     * @param userId the user rejecting
     * @param reason the reason for rejection
     */
    void rejectAdjustment(Long adjustmentId, Long userId, String reason);
    
    /**
     * Update the quality of a store item
     * 
     * @param itemId the item to update
     * @param newQuality the new quality
     * @param notes notes about the quality change
     * @param userId the user performing the update
     * @return the updated item
     */
    StoreItemResponse updateItemQuality(Long itemId, StoreItemQuality newQuality, String notes, Long userId);
    
    /**
     * Adjust quantity of a store item
     * 
     * @param itemId the item to adjust
     * @param quantityChange the change in quantity (positive or negative)
     * @param notes notes about the adjustment
     * @param userId the user performing the adjustment
     * @return the updated item
     */
    StoreItemResponse adjustQuantity(Long itemId, Integer quantityChange, String notes, Long userId);
    
    /**
     * Use items from store (decrement quantity)
     * 
     * @param itemId the item to use
     * @param quantity the quantity to use
     * @param notes notes about the usage
     * @param userId the user performing the action
     * @return the updated item
     */
    StoreItemResponse useItem(Long itemId, Integer quantity, String notes, Long userId);
    
    /**
     * Write off a store item (mark as damaged/unusable)
     * 
     * @param itemId the item to write off
     * @param notes notes about the write-off
     * @param userId the user performing the action
     */
    void writeOffItem(Long itemId, String notes, Long userId);
    
    /**
     * Get store statistics
     * 
     * @return store statistics including total items, value, etc.
     */
    StoreStatisticsResponse getStoreStatistics();
    
    /**
     * Get items available for a specific fabric and product type
     * 
     * @param fabricId the fabric ID
     * @param productTypeId the product type ID
     * @return list of available items
     */
    Map<String, Object> getAvailableItemsForProduct(Long fabricId, Long productTypeId);

    /**
     * Get store adjustments filtered by status
     *
     * @param status adjustment status to filter by
     * @param pageable pagination
     */
    Page<StoreAdjustmentResponse> getAdjustments(StoreAdjustmentStatus status, Pageable pageable);
}
