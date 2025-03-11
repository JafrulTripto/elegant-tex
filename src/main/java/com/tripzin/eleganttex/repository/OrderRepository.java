package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.marketplace WHERE o.id = :id")
    Optional<Order> findByIdWithMarketplace(@Param("id") Long id);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.marketplace LEFT JOIN FETCH o.products p LEFT JOIN FETCH p.fabric WHERE o.id = :id")
    Optional<Order> findByIdWithProductsAndFabrics(@Param("id") Long id);
    
    Page<Order> findByMarketplaceId(Long marketplaceId, Pageable pageable);
    
    Page<Order> findByStatus(String status, Pageable pageable);
    
    Page<Order> findByDeliveryDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    Page<Order> findByCreatedById(Long userId, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:startDate IS NULL OR o.deliveryDate >= :startDate) AND " +
           "(:endDate IS NULL OR o.deliveryDate <= :endDate) AND " +
           "(:marketplaceId IS NULL OR o.marketplace.id = :marketplaceId) AND " +
           "(:customerName IS NULL OR LOWER(CAST(o.customerName as string)) LIKE LOWER(CONCAT('%', CAST(:customerName AS string), '%')))")
    Page<Order> findByFilters(
            @Param("status") String status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("marketplaceId") Long marketplaceId,
            @Param("customerName") String customerName,
            Pageable pageable);
            
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:startDate IS NULL OR o.deliveryDate >= :startDate) AND " +
           "(:endDate IS NULL OR o.deliveryDate <= :endDate) AND " +
           "(:marketplaceId IS NULL OR o.marketplace.id = :marketplaceId) AND " +
           "(:createdById IS NULL OR o.createdBy.id = :createdById)")
    Page<Order> findByFiltersWithCreatedBy(
            @Param("status") String status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("marketplaceId") Long marketplaceId,
            @Param("createdById") Long createdById,
            Pageable pageable);
    
    @Query(value = "SELECT o.status as status, COUNT(o.id) as count FROM orders o GROUP BY o.status", nativeQuery = true)
    List<Map<String, Object>> getOrderStatusCounts();
    
    @Query(value = "SELECT o.status, COUNT(o.id) FROM orders o GROUP BY o.status", nativeQuery = true)
    List<Object[]> countByStatusGrouped();
}
