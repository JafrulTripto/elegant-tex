package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderStatus;
import com.tripzin.eleganttex.entity.OrderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.marketplace LEFT JOIN FETCH o.customer WHERE o.id = :id")
    Optional<Order> findByIdWithMarketplace(@Param("id") Long id);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.marketplace LEFT JOIN FETCH o.customer LEFT JOIN FETCH o.products p LEFT JOIN FETCH p.fabric WHERE o.id = :id")
    Optional<Order> findByIdWithProductsAndFabrics(@Param("id") Long id);
    
    Page<Order> findByMarketplaceId(Long marketplaceId, Pageable pageable);
    
    Page<Order> findByOrderType(OrderType orderType, Pageable pageable);
    
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    Page<Order> findByDeliveryDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    Page<Order> findByCreatedById(Long userId, Pageable pageable);
    
    @Query("SELECT o FROM Order o JOIN o.customer c WHERE " +
           "(:#{#status == null} = true OR o.status = :status) AND " +
           "(:#{#startDate == null} = true OR o.deliveryDate >= :startDate) AND " +
           "(:#{#endDate == null} = true OR o.deliveryDate <= :endDate) AND " +
           "(:#{#marketplaceId == null} = true OR o.marketplace.id = :marketplaceId) AND " +
           "(:#{#customerName == null or #customerName == ''} = true OR LOWER(c.name) LIKE LOWER(CONCAT('%', :customerName, '%'))) AND " +
           "(:#{#orderNumber == null or #orderNumber == ''} = true OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :orderNumber, '%'))) AND " +
           "(:#{#deliveryChannel == null or #deliveryChannel == ''} = true OR LOWER(o.deliveryChannel) LIKE LOWER(CONCAT('%', :deliveryChannel, '%'))) AND " +
           "(:#{#minAmount == null} = true OR o.totalAmount >= :minAmount) AND " +
           "(:#{#maxAmount == null} = true OR o.totalAmount <= :maxAmount)")
    Page<Order> findByFilters(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("marketplaceId") Long marketplaceId,
            @Param("customerName") String customerName,
            @Param("orderNumber") String orderNumber,
            @Param("deliveryChannel") String deliveryChannel,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            Pageable pageable);
            
    @Query("SELECT o FROM Order o JOIN o.customer c WHERE " +
           "o.orderType = :orderType AND " +
           "(:#{#status == null} = true OR o.status = :status) AND " +
           "(:#{#startDate == null} = true OR o.deliveryDate >= :startDate) AND " +
           "(:#{#endDate == null} = true OR o.deliveryDate <= :endDate) AND " +
           "(:#{#marketplaceId == null} = true OR o.marketplace.id = :marketplaceId) AND " +
           "(:#{#customerName == null or #customerName == ''} = true OR LOWER(c.name) LIKE LOWER(CONCAT('%', :customerName, '%'))) AND " +
           "(:#{#orderNumber == null or #orderNumber == ''} = true OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :orderNumber, '%'))) AND " +
           "(:#{#deliveryChannel == null or #deliveryChannel == ''} = true OR LOWER(o.deliveryChannel) LIKE LOWER(CONCAT('%', :deliveryChannel, '%'))) AND " +
           "(:#{#minAmount == null} = true OR o.totalAmount >= :minAmount) AND " +
           "(:#{#maxAmount == null} = true OR o.totalAmount <= :maxAmount)")
    Page<Order> findByOrderTypeAndFilters(
            @Param("orderType") OrderType orderType,
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("marketplaceId") Long marketplaceId,
            @Param("customerName") String customerName,
            @Param("orderNumber") String orderNumber,
            @Param("deliveryChannel") String deliveryChannel,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            Pageable pageable);
            
    @Query("SELECT o FROM Order o JOIN o.customer c WHERE " +
           "(:#{#status == null} = true OR o.status = :status) AND " +
           "(:#{#startDate == null} = true OR o.deliveryDate >= :startDate) AND " +
           "(:#{#endDate == null} = true OR o.deliveryDate <= :endDate) AND " +
           "(:#{#marketplaceId == null} = true OR o.marketplace.id = :marketplaceId) AND " +
           "(:#{#createdById == null} = true OR o.createdBy.id = :createdById) AND " +
           "(:#{#orderNumber == null or #orderNumber == ''} = true OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :orderNumber, '%'))) AND " +
           "(:#{#minAmount == null} = true OR o.totalAmount >= :minAmount) AND " +
           "(:#{#maxAmount == null} = true OR o.totalAmount <= :maxAmount)")
    Page<Order> findByFiltersWithCreatedBy(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("marketplaceId") Long marketplaceId,
            @Param("createdById") Long createdById,
            @Param("orderNumber") String orderNumber,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            Pageable pageable);
            
    @Query("SELECT o FROM Order o JOIN o.customer c WHERE " +
           "(:#{#status == null} = true OR o.status = :status) AND " +
           "(:#{#startDate == null} = true OR CAST(o.createdAt AS LocalDate) >= :startDate) AND " +
           "(:#{#endDate == null} = true OR CAST(o.createdAt AS LocalDate) <= :endDate) AND " +
           "(:#{#marketplaceId == null} = true OR o.marketplace.id = :marketplaceId) AND " +
           "(:#{#customerName == null or #customerName == ''} = true OR LOWER(c.name) LIKE LOWER(CONCAT('%', :customerName, '%')))")
    Page<Order> findByFiltersWithCreatedAt(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("marketplaceId") Long marketplaceId,
            @Param("customerName") String customerName,
            Pageable pageable);
            
    /**
     * Find orders with filters including order type for Excel export
     * @param status optional status filter
     * @param startDate optional start date filter
     * @param endDate optional end date filter
     * @param orderType optional order type filter (MARKETPLACE or MERCHANT)
     * @return list of orders matching the filters
     */
    default List<Order> findByFiltersForExcel(OrderStatus status, OrderType orderType, LocalDate startDate, LocalDate endDate) {
        return findAll((root, query, cb) -> {
            var predicates = cb.conjunction();

            if (status != null) {
                predicates = cb.and(predicates, cb.equal(root.get("status"), status));
            }

            if (orderType != null) {
                predicates = cb.and(predicates, cb.equal(root.get("orderType"), orderType));
            }

            if (startDate != null) {
                predicates = cb.and(predicates, cb.greaterThanOrEqualTo(root.get("createdAt"), startDate.atStartOfDay()));
            }

            if (endDate != null) {
                predicates = cb.and(predicates, cb.lessThanOrEqualTo(root.get("createdAt"), endDate.atTime(23, 59, 59)));
            }

            return predicates;
        });
    }
    
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
