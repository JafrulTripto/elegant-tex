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
    
    Page<OrderResponse> getOrdersByFilters(String orderType, String status, LocalDate startDate, LocalDate endDate, Long marketplaceId, String customerName, Pageable pageable);
    
    OrderResponse updateOrderStatus(Long id, String status, String notes, Long userId);
    
    void deleteOrder(Long id);
    
    ResponseEntity<Resource> generateOrderPdf(Long id);
    
    ResponseEntity<Resource> generateOrdersExcel(String status, LocalDate startDate, LocalDate endDate);
    
    /**
     * Get order counts by status for the current month or year
     * @param currentMonth true for current month, false for current year
     * @return List of maps containing status and count
     */
    List<Map<String, Object>> getOrderStatusCounts(boolean currentMonth);
    
    /**
     * Get order counts by status for a specific month and year
     * @param month the month (0-11)
     * @param year the year
     * @return List of maps containing status and count
     */
    List<Map<String, Object>> getOrderStatusCountsByMonth(int month, int year);
    
    /**
     * Get order statistics by user for the current month or year
     * @param currentMonth true for current month, false for current year
     * @return List of maps containing user information, order count, and total amount
     */
    List<Map<String, Object>> getUserOrderStatistics(boolean currentMonth);
    
    /**
     * Get order statistics by user for a specific month and year
     * @param month the month (0-11)
     * @param year the year
     * @return List of maps containing user information, order count, and total amount
     */
    List<Map<String, Object>> getUserOrderStatisticsByMonth(int month, int year);
    
    /**
     * Get order statistics by marketplace for the current month or year
     * @param currentMonth true for current month, false for current year
     * @return List of maps containing marketplace information and total amount
     */
    List<Map<String, Object>> getMarketplaceOrderStatistics(boolean currentMonth);
    
    /**
     * Get order statistics by marketplace for a specific month and year
     * @param month the month (0-11)
     * @param year the year
     * @return List of maps containing marketplace information and total amount
     */
    List<Map<String, Object>> getMarketplaceOrderStatisticsByMonth(int month, int year);
    
    /**
     * Find orders with similar products based on product type, fabric, and description
     * Limited to returned or cancelled orders
     * @param orderId the order ID to find similar orders for
     * @param limit maximum number of similar orders to return
     * @return list of similar orders
     */
    List<OrderResponse> findSimilarOrders(Long orderId, int limit);
    
    /**
     * Get daily order counts between two dates
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @return List of maps containing date and count
     */
    List<Map<String, Object>> getMonthlyOrderData(LocalDate startDate, LocalDate endDate);
    
    /**
     * Get monthly order count and amount statistics
     * @param month the month (0-11)
     * @param year the year
     * @param currentMonth whether to use current month if month/year not provided
     * @return List of maps containing date, count, and amount
     */
    List<Map<String, Object>> getMonthlyOrderCountAndAmount(Integer month, Integer year, boolean currentMonth);
    
    /**
     * Reuse a cancelled or returned order to create a new order
     * @param orderId the ID of the order to reuse
     * @param userId the ID of the user creating the new order
     * @return the newly created order
     */
    OrderResponse reuseOrder(Long orderId, Long userId);
}
