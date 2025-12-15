package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.response.StoreItemResponse;
import com.tripzin.eleganttex.entity.StoreItemQuality;
import com.tripzin.eleganttex.entity.StoreItemSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for store item operations
 */
public interface StoreItemService {
    
    /**
     * Get all store items with pagination
     * 
     * @param pageable pagination information
     * @return page of store items
     */
    Page<StoreItemResponse> getAllItems(Pageable pageable);
    
    /**
     * Get store item by ID
     * 
     * @param id the item ID
     * @return the store item
     */
    StoreItemResponse getItemById(Long id);
    
    /**
     * Get store item by SKU
     * 
     * @param sku the SKU
     * @return the store item
     */
    StoreItemResponse getItemBySku(String sku);
    
    /**
     * Search items by filters
     * 
     * @param fabricId optional fabric filter
     * @param productTypeId optional product type filter
     * @param quality optional quality filter
     * @param sourceType optional source type filter
     * @param sku optional SKU search
     * @param onlyWithStock only return items with quantity > 0
     * @param pageable pagination information
     * @return page of filtered items
     */
    Page<StoreItemResponse> searchItems(
        Long fabricId,
        Long productTypeId,
        StoreItemQuality quality,
        StoreItemSource sourceType,
        String sku,
        Boolean onlyWithStock,
        Pageable pageable
    );
    
    /**
     * Get items from a specific order
     * 
     * @param orderNumber the order number
     * @return list of items from that order
     */
    Page<StoreItemResponse> getItemsByOrderNumber(String orderNumber, Pageable pageable);
    
    /**
     * Delete a store item
     * 
     * @param id the item ID
     * @param userId the user performing the deletion
     */
    void deleteItem(Long id, Long userId);
}
