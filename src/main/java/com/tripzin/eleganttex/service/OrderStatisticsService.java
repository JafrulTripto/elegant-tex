package com.tripzin.eleganttex.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Service interface for order statistics operations
 */
public interface OrderStatisticsService {
    /**
     * Get order status counts for the current month or year
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
}
