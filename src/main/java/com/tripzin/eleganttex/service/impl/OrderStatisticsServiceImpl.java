package com.tripzin.eleganttex.service.impl;

import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderStatus;
import com.tripzin.eleganttex.repository.OrderRepository;
import com.tripzin.eleganttex.service.OrderStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of OrderStatisticsService for handling order statistics operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderStatisticsServiceImpl implements OrderStatisticsService {

    private final OrderRepository orderRepository;

    /**
     * Get order status counts for the current month or year
     */
    @Override
    public List<Map<String, Object>> getOrderStatusCounts(boolean currentMonth, String orderType) {
        log.info("Getting order status counts for {} with order type: {}", 
                currentMonth ? "current month" : "current year", orderType);
        
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate = now;
        
        if (currentMonth) {
            // Current month: from first day of current month to today
            startDate = now.withDayOfMonth(1);
        } else {
            // Current year: from first day of current year to today
            startDate = now.withDayOfYear(1);
        }
        
        return getOrderStatusCountsByDateRange(startDate, endDate, orderType);
    }
    
    /**
     * Get order counts by status for a specific month and year
     */
    @Override
    public List<Map<String, Object>> getOrderStatusCountsByMonth(int month, int year, String orderType) {
        log.info("Getting order status counts for month {} of year {} with order type: {}", month, year, orderType);
        
        // Calculate start and end dates for the specified month
        // Note: Month is 0-based in JS, 1-based in Java
        LocalDate startDate = LocalDate.of(year, month + 1, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        
        return getOrderStatusCountsByDateRange(startDate, endDate, orderType);
    }
    
    /**
     * Get order counts by status for a specific date range
     */
    @Override
    public List<Map<String, Object>> getOrderStatusCountsByDateRange(LocalDate startDate, LocalDate endDate, String orderType) {
        log.info("Getting order status counts from {} to {} with order type: {}", startDate, endDate, orderType);
        
        // Get all orders in the date range
        List<Order> orders = orderRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(), 
                endDate.atTime(23, 59, 59)
        );
        
        // Filter by order type if specified
        if (orderType != null && !orderType.isEmpty()) {
            orders = orders.stream()
                    .filter(order -> {
                        if ("marketplace".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() != null;
                        } else if ("merchant".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() == null;
                        }
                        return true; // If orderType is not recognized, include all orders
                    })
                    .toList();
        }
        
        // Count orders by status
        Map<String, Integer> statusCounts = new HashMap<>();
        for (Order order : orders) {
            String status = order.getStatus().name();
            statusCounts.put(status, statusCounts.getOrDefault(status, 0) + 1);
        }
        
        // Convert to list of maps
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : statusCounts.entrySet()) {
            Map<String, Object> statusCount = new HashMap<>();
            statusCount.put("status", entry.getKey());
            statusCount.put("count", entry.getValue());
            result.add(statusCount);
        }
        
        return result;
    }
    
    /**
     * Get user order statistics
     */
    @Override
    public List<Map<String, Object>> getUserOrderStatistics(boolean currentMonth, String orderType) {
        log.info("Getting user order statistics for {} with order type: {}", 
                currentMonth ? "current month" : "current year", orderType);
        
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate = now;
        
        if (currentMonth) {
            // Current month: from first day of current month to today
            startDate = now.withDayOfMonth(1);
        } else {
            // Current year: from first day of current year to today
            startDate = now.withDayOfYear(1);
        }
        
        return getUserOrderStatisticsByDateRange(startDate, endDate, orderType);
    }
    
    /**
     * Get user order statistics for a specific month and year
     */
    @Override
    public List<Map<String, Object>> getUserOrderStatisticsByMonth(int month, int year, String orderType) {
        log.info("Getting user order statistics for month {} of year {} with order type: {}", month, year, orderType);
        
        // Calculate start and end dates for the specified month
        // Note: Month is 0-based in JS, 1-based in Java
        LocalDate startDate = LocalDate.of(year, month + 1, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        
        return getUserOrderStatisticsByDateRange(startDate, endDate, orderType);
    }
    
    /**
     * Get user order statistics for a specific date range
     */
    @Override
    public List<Map<String, Object>> getUserOrderStatisticsByDateRange(LocalDate startDate, LocalDate endDate, String orderType) {
        log.info("Getting user order statistics from {} to {} with order type: {}", startDate, endDate, orderType);
        
        // Get all orders in the date range
        List<Order> orders = orderRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(), 
                endDate.atTime(23, 59, 59)
        );
        
        // Filter by order type if specified
        if (orderType != null && !orderType.isEmpty()) {
            orders = orders.stream()
                    .filter(order -> {
                        if ("marketplace".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() != null;
                        } else if ("merchant".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() == null;
                        }
                        return true; // If orderType is not recognized, include all orders
                    })
                    .toList();
        }
        
        return calculateUserOrderStatistics(orders);
    }
    
    /**
     * Helper method to calculate user order statistics from a list of orders
     */
    private List<Map<String, Object>> calculateUserOrderStatistics(List<Order> orders) {
        // Group orders by user and calculate statistics
        Map<Long, Map<String, Object>> userStatsMap = new HashMap<>();
        
        for (Order order : orders) {
            Long userId = order.getCreatedBy().getId();
            
            // Initialize user stats if not exists
            if (!userStatsMap.containsKey(userId)) {
                Map<String, Object> userStats = new HashMap<>();
                userStats.put("userId", userId);
                userStats.put("firstName", order.getCreatedBy().getFirstName());
                userStats.put("lastName", order.getCreatedBy().getLastName());
                userStats.put("email", order.getCreatedBy().getEmail());
                userStats.put("orderCount", 0);
                userStats.put("totalAmount", BigDecimal.ZERO);
                
                userStatsMap.put(userId, userStats);
            }
            
            // Update user stats
            Map<String, Object> userStats = userStatsMap.get(userId);
            int orderCount = (int) userStats.get("orderCount");
            BigDecimal totalAmount = (BigDecimal) userStats.get("totalAmount");
            
            userStats.put("orderCount", orderCount + 1);
            userStats.put("totalAmount", totalAmount.add(order.getTotalAmount()));
        }
        
        // Convert map to list and sort by order count (descending)
        List<Map<String, Object>> result = new ArrayList<>(userStatsMap.values());
        result.sort((a, b) -> Integer.compare((int) b.get("orderCount"), (int) a.get("orderCount")));
        
        return result;
    }
    
    /**
     * Get marketplace order statistics
     */
    @Override
    public List<Map<String, Object>> getMarketplaceOrderStatistics(boolean currentMonth, String orderType) {
        log.info("Getting marketplace order statistics for {} with order type: {}", 
                currentMonth ? "current month" : "current year", orderType);
        
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate = now;
        
        if (currentMonth) {
            // Current month: from first day of current month to today
            startDate = now.withDayOfMonth(1);
        } else {
            // Current year: from first day of current year to today
            startDate = now.withDayOfYear(1);
        }
        
        return getMarketplaceOrderStatisticsByDateRange(startDate, endDate, orderType);
    }
    
    /**
     * Get marketplace order statistics for a specific month and year
     */
    @Override
    public List<Map<String, Object>> getMarketplaceOrderStatisticsByMonth(int month, int year, String orderType) {
        log.info("Getting marketplace order statistics for month {} of year {} with order type: {}", month, year, orderType);
        
        // Calculate start and end dates for the specified month
        // Note: Month is 0-based in JS, 1-based in Java
        LocalDate startDate = LocalDate.of(year, month + 1, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        
        return getMarketplaceOrderStatisticsByDateRange(startDate, endDate, orderType);
    }
    
    /**
     * Get marketplace order statistics for a specific date range
     */
    @Override
    public List<Map<String, Object>> getMarketplaceOrderStatisticsByDateRange(LocalDate startDate, LocalDate endDate, String orderType) {
        log.info("Getting marketplace order statistics from {} to {} with order type: {}", startDate, endDate, orderType);
        
        // Get all orders in the date range
        List<Order> orders = orderRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(), 
                endDate.atTime(23, 59, 59)
        );
        
        // Filter by order type if specified
        if (orderType != null && !orderType.isEmpty()) {
            orders = orders.stream()
                    .filter(order -> {
                        if ("marketplace".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() != null;
                        } else if ("merchant".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() == null;
                        }
                        return true; // If orderType is not recognized, include all orders
                    })
                    .toList();
        }
        
        return calculateMarketplaceOrderStatistics(orders);
    }
    
    /**
     * Helper method to calculate marketplace order statistics from a list of orders
     */
    private List<Map<String, Object>> calculateMarketplaceOrderStatistics(List<Order> orders) {
        // Group orders by marketplace and calculate statistics
        Map<Long, Map<String, Object>> marketplaceStatsMap = new HashMap<>();
        Map<String, Object> merchantOrderStats = new HashMap<>();
        merchantOrderStats.put("marketplaceId", null);
        merchantOrderStats.put("name", "Direct Merchant");
        merchantOrderStats.put("totalAmount", BigDecimal.ZERO);
        
        for (Order order : orders) {
            // Skip orders without a marketplace (merchant orders)
            if (order.getMarketplace() == null) {
                // Add to merchant orders category
                BigDecimal totalAmount = (BigDecimal) merchantOrderStats.get("totalAmount");
                merchantOrderStats.put("totalAmount", totalAmount.add(order.getTotalAmount()));
                continue;
            }
            
            Long marketplaceId = order.getMarketplace().getId();
            
            // Initialize marketplace stats if not exists
            if (!marketplaceStatsMap.containsKey(marketplaceId)) {
                Map<String, Object> marketplaceStats = new HashMap<>();
                marketplaceStats.put("marketplaceId", marketplaceId);
                marketplaceStats.put("name", order.getMarketplace().getName());
                marketplaceStats.put("totalAmount", BigDecimal.ZERO);
                
                marketplaceStatsMap.put(marketplaceId, marketplaceStats);
            }
            
            // Update marketplace stats
            Map<String, Object> marketplaceStats = marketplaceStatsMap.get(marketplaceId);
            BigDecimal totalAmount = (BigDecimal) marketplaceStats.get("totalAmount");
            
            marketplaceStats.put("totalAmount", totalAmount.add(order.getTotalAmount()));
        }
        
        // Add merchant orders to the result if there are any
        if (!((BigDecimal) merchantOrderStats.get("totalAmount")).equals(BigDecimal.ZERO)) {
            marketplaceStatsMap.put(-1L, merchantOrderStats);
        }
        
        // Convert map to list and sort by total amount (descending)
        List<Map<String, Object>> result = new ArrayList<>(marketplaceStatsMap.values());
        result.sort((a, b) -> ((BigDecimal) b.get("totalAmount")).compareTo((BigDecimal) a.get("totalAmount")));
        
        return result;
    }
    
    /**
     * Get daily order counts between two dates
     */
    @Override
    public List<Map<String, Object>> getMonthlyOrderData(LocalDate startDate, LocalDate endDate) {
        log.info("Getting monthly order data from {} to {}", startDate, endDate);
        
        // Get counts directly from the database
        List<Object[]> results = orderRepository.countOrdersByDateBetween(startDate, endDate);
        
        // Initialize all dates in the range with 0 orders
        Map<String, Integer> ordersByDate = new HashMap<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            ordersByDate.put(current.toString(), 0);
            current = current.plusDays(1);
        }
        
        // Fill in actual counts from database results
        for (Object[] result : results) {
            String date = ((LocalDate) result[0]).toString();
            Integer count = ((Number) result[1]).intValue();
            ordersByDate.put(date, count);
        }
        
        // Convert to list of maps for the response
        List<Map<String, Object>> response = new ArrayList<>();
        ordersByDate.forEach((date, count) -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", date);
            entry.put("count", count);
            response.add(entry);
        });
        
        // Sort by date
        response.sort(Comparator.comparing(m -> (String) m.get("date")));
        
        return response;
    }
    
    /**
     * Get monthly order count and amount statistics
     */
    @Override
    public List<Map<String, Object>> getMonthlyOrderCountAndAmount(Integer month, Integer year, boolean currentMonth, String orderType) {
        log.info("Getting monthly order count and amount for month: {}, year: {}, currentMonth: {}, orderType: {}", month, year, currentMonth, orderType);
        
        // Calculate date range based on parameters
        LocalDate startDate, endDate;
        
        if (month != null && year != null) {
            // Use specified month and year
            startDate = LocalDate.of(year, month + 1, 1);
            endDate = startDate.plusMonths(1).minusDays(1);
        } else {
            // Use current month or year based on currentMonth flag
            LocalDate now = LocalDate.now();
            endDate = now;
            
            if (currentMonth) {
                startDate = now.withDayOfMonth(1);
            } else {
                startDate = now.withDayOfYear(1);
            }
        }
        
        return getMonthlyOrderCountAndAmountByDateRange(startDate, endDate, orderType);
    }
    
    /**
     * Get monthly order count and amount statistics for a specific date range
     */
    @Override
    public List<Map<String, Object>> getMonthlyOrderCountAndAmountByDateRange(LocalDate startDate, LocalDate endDate, String orderType) {
        log.info("Getting monthly order count and amount from {} to {} with order type: {}", startDate, endDate, orderType);
        
        // Get orders in date range
        List<Order> orders = orderRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(), 
                endDate.atTime(23, 59, 59)
        );
        
        // Filter by order type if specified
        if (orderType != null && !orderType.isEmpty()) {
            orders = orders.stream()
                    .filter(order -> {
                        if ("marketplace".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() != null;
                        } else if ("merchant".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() == null;
                        }
                        return true; // If orderType is not recognized, include all orders
                    })
                    .toList();
        }
        
        // Group by date and calculate count and amount
        Map<String, Map<String, Object>> resultMap = new HashMap<>();
        
        for (Order order : orders) {
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            String dateKey = orderDate.toString();
            
            if (!resultMap.containsKey(dateKey)) {
                Map<String, Object> dayData = new HashMap<>();
                dayData.put("date", dateKey);
                dayData.put("count", 0);
                dayData.put("amount", BigDecimal.ZERO);
                resultMap.put(dateKey, dayData);
            }
            
            Map<String, Object> dayData = resultMap.get(dateKey);
            int count = (int) dayData.get("count");
            BigDecimal amount = (BigDecimal) dayData.get("amount");
            
            dayData.put("count", count + 1);
            dayData.put("amount", amount.add(order.getTotalAmount()));
        }
        
        // Fill in missing dates with zero values
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            String dateKey = current.toString();
            if (!resultMap.containsKey(dateKey)) {
                Map<String, Object> dayData = new HashMap<>();
                dayData.put("date", dateKey);
                dayData.put("count", 0);
                dayData.put("amount", BigDecimal.ZERO);
                resultMap.put(dateKey, dayData);
            }
            current = current.plusDays(1);
        }
        
        // Convert to list and sort by date
        List<Map<String, Object>> result = new ArrayList<>(resultMap.values());
        result.sort(Comparator.comparing(m -> (String) m.get("date")));
        
        return result;
    }
    
    /**
     * Get sales data (revenue) for dashboard
     */
    @Override
    public Map<String, Object> getSalesData(LocalDate startDate, LocalDate endDate, String orderType) {
        log.info("Getting sales data from {} to {} with order type: {}", startDate, endDate, orderType);
        
        // If dates not provided, default to current month
        if (startDate == null || endDate == null) {
            LocalDate now = LocalDate.now();
            startDate = now.withDayOfMonth(1);
            endDate = now;
        }
        
        // Get orders in date range
        List<Order> orders = orderRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(), 
                endDate.atTime(23, 59, 59)
        );
        
        // Filter by order type if specified
        if (orderType != null && !orderType.isEmpty()) {
            orders = orders.stream()
                    .filter(order -> {
                        if ("marketplace".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() != null;
                        } else if ("merchant".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() == null;
                        }
                        return true; // If orderType is not recognized, include all orders
                    })
                    .toList();
        }
        
        // Calculate sales metrics
        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalOrders = orders.size();
        int completedOrders = 0;
        int pendingOrders = 0;
        
        for (Order order : orders) {
            totalRevenue = totalRevenue.add(order.getTotalAmount());
            
            // Count orders by status
            switch (order.getStatus()) {
                case DELIVERED:
                    completedOrders++;
                    break;
                case ORDER_CREATED:
                case APPROVED:
                case BOOKING:
                case PRODUCTION:
                case QA:
                case READY:
                    pendingOrders++;
                    break;
                case RETURNED:
                case CANCELLED:
                default:
                    break;
            }
        }
        
        // Calculate average order value
        BigDecimal averageOrderValue = totalOrders > 0 ? 
                totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;
        
        // Build response
        Map<String, Object> salesData = new HashMap<>();
        salesData.put("totalRevenue", totalRevenue);
        salesData.put("totalOrders", totalOrders);
        salesData.put("completedOrders", completedOrders);
        salesData.put("pendingOrders", pendingOrders);
        salesData.put("averageOrderValue", averageOrderValue);
        salesData.put("startDate", startDate.toString());
        salesData.put("endDate", endDate.toString());
        salesData.put("orderType", orderType);
        
        return salesData;
    }
    
    /**
     * Get order statistics summary for reactive dashboard cards
     */
    @Override
    public Map<String, Object> getOrderStatisticsSummary(LocalDate startDate, LocalDate endDate, String orderType) {
        log.info("Getting order statistics summary from {} to {} with order type: {}", startDate, endDate, orderType);
        
        // Get orders in date range
        List<Order> orders = orderRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(), 
                endDate.atTime(23, 59, 59)
        );
        
        // Filter by order type if specified and not "all"
        if (orderType != null && !orderType.isEmpty() && !"all".equalsIgnoreCase(orderType)) {
            orders = orders.stream()
                    .filter(order -> {
                        if ("marketplace".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() != null;
                        } else if ("merchant".equalsIgnoreCase(orderType)) {
                            return order.getMarketplace() == null;
                        }
                        return true; // If orderType is not recognized, include all orders
                    })
                    .toList();
        }
        
        // Calculate summary statistics
        int totalOrders = orders.size();
        BigDecimal totalSales = BigDecimal.ZERO;
        int deliveredOrders = 0;
        
        for (Order order : orders) {
            totalSales = totalSales.add(order.getTotalAmount());
            
            // Count delivered orders
            if (order.getStatus() == OrderStatus.DELIVERED) {
                deliveredOrders++;
            }
        }
        
        // Build response
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalOrders", totalOrders);
        summary.put("totalSales", totalSales);
        summary.put("deliveredOrders", deliveredOrders);
        
        return summary;
    }
}
