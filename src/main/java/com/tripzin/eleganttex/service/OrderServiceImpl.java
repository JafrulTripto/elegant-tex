package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.request.OrderRequest;
import com.tripzin.eleganttex.dto.response.OrderResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Implementation of the OrderService interface using the Facade pattern
 * Delegates to specialized services for different responsibilities
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderCoreService orderCoreService;
    private final OrderSearchService orderSearchService;
    private final OrderStatusService orderStatusService;
    private final OrderStatisticsService orderStatisticsService;
    private final OrderReportService orderReportService;
    
    /**
     * Check if the current user has permission to view all orders
     * @return true if the user has the ORDER_READ_ALL permission, false otherwise
     */
    private boolean hasReadAllOrdersPermission() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equals("ORDER_READ_ALL"));
    }
    
    /**
     * Get the current user ID from the security context
     * @param userId the user ID passed from the controller (fallback)
     * @return the current user ID
     */
    private Long getCurrentUserId(Long userId) {
        // If userId is provided, use it
        if (userId != null) {
            return userId;
        }
        
        // Otherwise, try to get it from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof com.tripzin.eleganttex.security.services.UserDetailsImpl) {
            com.tripzin.eleganttex.security.services.UserDetailsImpl userDetails = 
                (com.tripzin.eleganttex.security.services.UserDetailsImpl) authentication.getPrincipal();
            return userDetails.getId();
        }
        
        return null;
    }

    @Override
    public OrderResponse createOrder(OrderRequest orderRequest, Long userId, List<MultipartFile> files) {
        return orderCoreService.createOrder(orderRequest, userId, files);
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        Long currentUserId = getCurrentUserId(null);
        boolean hasReadAllPermission = hasReadAllOrdersPermission();
        
        return orderCoreService.getOrderById(id, currentUserId, hasReadAllPermission);
    }

    @Override
    public OrderResponse updateOrder(Long id, OrderRequest orderRequest, Long userId, List<MultipartFile> files) {
        Long currentUserId = getCurrentUserId(null);
        boolean hasReadAllPermission = hasReadAllOrdersPermission();
        
        return orderCoreService.updateOrder(id, orderRequest, userId, files, currentUserId, hasReadAllPermission);
    }

    @Override
    public void deleteOrder(Long id) {
        Long currentUserId = getCurrentUserId(null);
        boolean hasReadAllPermission = hasReadAllOrdersPermission();
        
        orderCoreService.deleteOrder(id, currentUserId, hasReadAllPermission);
    }

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Long currentUserId = getCurrentUserId(null);
        boolean hasReadAllPermission = hasReadAllOrdersPermission();
        
        return orderSearchService.getAllOrders(currentUserId, hasReadAllPermission, pageable);
    }

    @Override
    public Page<OrderResponse> getOrdersByMarketplaceId(Long marketplaceId, Pageable pageable) {
        Long currentUserId = getCurrentUserId(null);
        boolean hasReadAllPermission = hasReadAllOrdersPermission();
        
        return orderSearchService.getOrdersByMarketplaceId(marketplaceId, currentUserId, hasReadAllPermission, pageable);
    }

    @Override
    public Page<OrderResponse> getOrdersByCreatedById(Long userId, Pageable pageable) {
        // This method is specifically for getting orders by a user ID, so we don't need to check permissions
        return orderSearchService.getOrdersByCreatedById(userId, pageable);
    }

    @Override
    public Page<OrderResponse> getOrdersByStatus(String status, Pageable pageable) {
        Long currentUserId = getCurrentUserId(null);
        boolean hasReadAllPermission = hasReadAllOrdersPermission();
        
        return orderSearchService.getOrdersByStatus(status, currentUserId, hasReadAllPermission, pageable);
    }

    @Override
    public Page<OrderResponse> getOrdersByDeliveryDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        Long currentUserId = getCurrentUserId(null);
        boolean hasReadAllPermission = hasReadAllOrdersPermission();
        
        return orderSearchService.getOrdersByDeliveryDateBetween(startDate, endDate, currentUserId, hasReadAllPermission, pageable);
    }

    @Override
    public Page<OrderResponse> getOrdersByFilters(
            String status,
            LocalDate startDate,
            LocalDate endDate,
            Long marketplaceId,
            String customerName,
            Pageable pageable) {
        Long currentUserId = getCurrentUserId(null);
        boolean hasReadAllPermission = hasReadAllOrdersPermission();
        
        return orderSearchService.getOrdersByFilters(status, startDate, endDate, marketplaceId, customerName, 
                currentUserId, hasReadAllPermission, pageable);
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, String status, String notes, Long userId) {
        return orderStatusService.updateOrderStatus(id, status, notes, userId);
    }

    @Override
    public ResponseEntity<Resource> generateOrderPdf(Long id) {
        return orderReportService.generateOrderPdf(id);
    }

    @Override
    public ResponseEntity<Resource> generateOrdersExcel(String status, LocalDate startDate, LocalDate endDate) {
        return orderReportService.generateOrdersExcel(status, startDate, endDate);
    }

    @Override
    public List<Map<String, Object>> getOrderStatusCounts(boolean currentMonth) {
        return orderStatisticsService.getOrderStatusCounts(currentMonth);
    }
    
    @Override
    public List<Map<String, Object>> getOrderStatusCountsByMonth(int month, int year) {
        return orderStatisticsService.getOrderStatusCountsByMonth(month, year);
    }
    
    @Override
    public List<Map<String, Object>> getUserOrderStatistics(boolean currentMonth) {
        return orderStatisticsService.getUserOrderStatistics(currentMonth);
    }
    
    @Override
    public List<Map<String, Object>> getUserOrderStatisticsByMonth(int month, int year) {
        return orderStatisticsService.getUserOrderStatisticsByMonth(month, year);
    }
    
    @Override
    public List<Map<String, Object>> getMarketplaceOrderStatistics(boolean currentMonth) {
        return orderStatisticsService.getMarketplaceOrderStatistics(currentMonth);
    }
    
    @Override
    public List<Map<String, Object>> getMarketplaceOrderStatisticsByMonth(int month, int year) {
        return orderStatisticsService.getMarketplaceOrderStatisticsByMonth(month, year);
    }
    
    @Override
    public List<OrderResponse> findSimilarOrders(Long orderId, int limit) {
        Long currentUserId = getCurrentUserId(null);
        boolean hasReadAllPermission = hasReadAllOrdersPermission();
        
        return orderSearchService.findSimilarOrders(orderId, limit, currentUserId, hasReadAllPermission);
    }
    
    @Override
    public List<Map<String, Object>> getMonthlyOrderData(LocalDate startDate, LocalDate endDate) {
        return orderStatisticsService.getMonthlyOrderData(startDate, endDate);
    }
    
    @Override
    public List<Map<String, Object>> getMonthlyOrderCountAndAmount(Integer month, Integer year, boolean currentMonth) {
        return orderStatisticsService.getMonthlyOrderCountAndAmount(month, year, currentMonth);
    }
}
