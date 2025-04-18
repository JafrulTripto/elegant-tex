package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.request.OrderRequest;
import com.tripzin.eleganttex.dto.response.OrderResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for core order operations
 */
public interface OrderCoreService {
    /**
     * Create a new order
     */
    OrderResponse createOrder(OrderRequest orderRequest, Long userId, List<MultipartFile> files);
    
    /**
     * Update an existing order
     * @param id the order ID
     * @param orderRequest the order request
     * @param userId the user ID
     * @param files the files to upload
     * @param currentUserId the current user ID (optional)
     * @param hasReadAllPermission whether the user has permission to update all orders
     * @return the updated order response
     */
    OrderResponse updateOrder(Long id, OrderRequest orderRequest, Long userId, List<MultipartFile> files, 
                             Long currentUserId, boolean hasReadAllPermission);
    
    /**
     * Get order by ID
     * @param id the order ID
     * @param currentUserId the current user ID (optional)
     * @param hasReadAllPermission whether the user has permission to view all orders
     * @return the order response
     */
    OrderResponse getOrderById(Long id, Long currentUserId, boolean hasReadAllPermission);
    
    /**
     * Delete an order
     * @param id the order ID
     * @param currentUserId the current user ID (optional)
     * @param hasReadAllPermission whether the user has permission to delete all orders
     */
    void deleteOrder(Long id, Long currentUserId, boolean hasReadAllPermission);
    
    /**
     * Reuse a cancelled or returned order to create a new order
     * @param orderId the ID of the order to reuse
     * @param userId the ID of the user creating the new order
     * @return the newly created order
     */
    OrderResponse reuseOrder(Long orderId, Long userId);
}
