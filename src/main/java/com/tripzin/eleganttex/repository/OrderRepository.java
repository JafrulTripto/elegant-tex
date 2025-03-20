package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.marketplace LEFT JOIN FETCH o.customer WHERE o.id = :id")
    Optional<Order> findByIdWithMarketplace(@Param("id") Long id);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.marketplace LEFT JOIN FETCH o.customer LEFT JOIN FETCH o.products p LEFT JOIN FETCH p.fabric WHERE o.id = :id")
    Optional<Order> findByIdWithProductsAndFabrics(@Param("id") Long id);
    
    Page<Order> findByMarketplaceId(Long marketplaceId, Pageable pageable);
    
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    Page<Order> findByDeliveryDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    Page<Order> findByCreatedById(Long userId, Pageable pageable);
    
    @Query("SELECT o FROM Order o JOIN o.customer c WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:startDate IS NULL OR o.deliveryDate >= :startDate) AND " +
           "(:endDate IS NULL OR o.deliveryDate <= :endDate) AND " +
           "(:marketplaceId IS NULL OR o.marketplace.id = :marketplaceId) AND " +
           "(:customerName IS NULL OR LOWER(CAST(c.name as string)) LIKE LOWER(CONCAT('%', CAST(:customerName AS string), '%')))")
    Page<Order> findByFilters(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("marketplaceId") Long marketplaceId,
            @Param("customerName") String customerName,
            Pageable pageable);
            
    @Query("SELECT o FROM Order o JOIN o.customer c WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:startDate IS NULL OR o.deliveryDate >= :startDate) AND " +
           "(:endDate IS NULL OR o.deliveryDate <= :endDate) AND " +
           "(:marketplaceId IS NULL OR o.marketplace.id = :marketplaceId) AND " +
           "(:createdById IS NULL OR o.createdBy.id = :createdById)")
    Page<Order> findByFiltersWithCreatedBy(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("marketplaceId") Long marketplaceId,
            @Param("createdById") Long createdById,
            Pageable pageable);
    
    @Query(value = "SELECT o.status as status, COUNT(o.id) as count FROM orders o GROUP BY o.status", nativeQuery = true)
    List<Map<String, Object>> getOrderStatusCounts();
    
    /**
     * Get order status counts for a specific date range
     * @param startDateTime start date-time (inclusive)
     * @param endDateTime end date-time (inclusive)
     * @return list of maps containing status and count
     */
    @Query(value = "SELECT o.status as status, COUNT(o.id) as count FROM orders o " +
           "WHERE o.created_at >= :startDateTime AND o.created_at <= :endDateTime " +
           "GROUP BY o.status", nativeQuery = true)
    List<Map<String, Object>> getOrderStatusCountsByDateRange(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);
    
    @Query(value = "SELECT o.status, COUNT(o.id) FROM orders o GROUP BY o.status", nativeQuery = true)
    List<Object[]> countByStatusGrouped();
    
    /**
     * Find orders created between the given date-time range
     * @param startDateTime start date-time (inclusive)
     * @param endDateTime end date-time (inclusive)
     * @return list of orders
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :startDateTime AND o.createdAt <= :endDateTime")
    List<Order> findByCreatedAtBetween(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);
            
    /**
     * Find similar orders based on product type AND fabric
     * Limited to returned or cancelled orders
     * @param orderId the order ID to exclude from results
     * @param productTypes list of product types to match
     * @param fabricIds list of fabric IDs to match
     * @param pageable pagination information
     * @return list of similar orders
     */
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.products p " +
           "WHERE o.id <> :orderId " +
           "AND (o.status = 'RETURNED' OR o.status = 'CANCELLED') " +
           "AND EXISTS (SELECT 1 FROM OrderProduct op WHERE op.order = o " +
           "            AND op.productType IN :productTypes " +
           "            AND op.fabric.id IN :fabricIds) " +
           "ORDER BY o.createdAt DESC")
    List<Order> findSimilarOrders(
            @Param("orderId") Long orderId,
            @Param("productTypes") List<String> productTypes,
            @Param("fabricIds") List<Long> fabricIds,
            Pageable pageable);
            
    /**
     * Find similar orders with a limit
     * @param orderId the order ID to exclude from results
     * @param productTypes list of product types to match
     * @param fabricIds list of fabric IDs to match
     * @param limit maximum number of results to return
     * @return list of similar orders
     */
    default List<Order> findSimilarOrders(
            Long orderId,
            List<String> productTypes,
            List<Long> fabricIds,
            int limit) {
        return findSimilarOrders(orderId, productTypes, fabricIds, PageRequest.of(0, limit));
    }
    
    /**
     * Count orders by date between a given date range
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @return list of arrays containing [date, count]
     */
    @Query("SELECT CAST(o.createdAt AS LocalDate) as orderDate, COUNT(o) as orderCount " +
           "FROM Order o " +
           "WHERE CAST(o.createdAt AS LocalDate) BETWEEN :startDate AND :endDate " +
           "GROUP BY CAST(o.createdAt AS LocalDate) " +
           "ORDER BY orderDate")
    List<Object[]> countOrdersByDateBetween(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);
}
