package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.request.OrderRequest;
import com.tripzin.eleganttex.dto.response.OrderResponse;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface OrderService {

    OrderResponse createOrder(OrderRequest orderRequest, Long userId, List<MultipartFile> files);
    
    OrderResponse updateOrder(Long id, OrderRequest orderRequest, Long userId, List<MultipartFile> files);
    
    OrderResponse getOrderById(Long id);
    
    Page<OrderResponse> getAllOrders(Pageable pageable);
    
    Page<OrderResponse> getOrdersByMarketplaceId(Long marketplaceId, Pageable pageable);
    
    Page<OrderResponse> getOrdersByStatus(String status, Pageable pageable);
    
    Page<OrderResponse> getOrdersByDeliveryDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    Page<OrderResponse> getOrdersByCreatedById(Long userId, Pageable pageable);
    
    Page<OrderResponse> getOrdersByFilters(String status, LocalDate startDate, LocalDate endDate, Long marketplaceId, String customerName, Pageable pageable);
    
    OrderResponse updateOrderStatus(Long id, String status, String notes, Long userId);
    
    void deleteOrder(Long id);
    
    ResponseEntity<Resource> generateOrderPdf(Long id);
    
    ResponseEntity<Resource> generateOrdersExcel(String status, LocalDate startDate, LocalDate endDate);
    
    List<Map<String, Object>> getOrderStatusCounts();
    
    /**
     * Get order statistics by user for the current month or year
     * @param currentMonth true for current month, false for current year
     * @return List of maps containing user information, order count, and total amount
     */
    List<Map<String, Object>> getUserOrderStatistics(boolean currentMonth);
    
    /**
     * Get order statistics by marketplace for the current month or year
     * @param currentMonth true for current month, false for current year
     * @return List of maps containing marketplace information and total amount
     */
    List<Map<String, Object>> getMarketplaceOrderStatistics(boolean currentMonth);
}
