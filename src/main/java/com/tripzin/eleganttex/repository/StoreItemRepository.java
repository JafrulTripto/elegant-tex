package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.StoreItem;
import com.tripzin.eleganttex.entity.StoreItemQuality;
import com.tripzin.eleganttex.entity.StoreItemSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreItemRepository extends JpaRepository<StoreItem, Long>, JpaSpecificationExecutor<StoreItem> {
    
    /**
     * Find store item by SKU
     */
    Optional<StoreItem> findBySku(String sku);
    
    /**
     * Check if store item exists by SKU
     */
    boolean existsBySku(String sku);
    
    /**
     * Find items by source order product ID
     */
    List<StoreItem> findBySourceOrderProductId(Long sourceOrderProductId);
    
    /**
     * Find items by source order number
     */
    List<StoreItem> findBySourceOrderNumber(String sourceOrderNumber);
    
    /**
     * Find items by fabric ID
     */
    Page<StoreItem> findByFabricId(Long fabricId, Pageable pageable);
    
    /**
     * Find items by product type ID
     */
    Page<StoreItem> findByProductTypeId(Long productTypeId, Pageable pageable);
    
    /**
     * Find items by quality
     */
    Page<StoreItem> findByQuality(StoreItemQuality quality, Pageable pageable);
    
    /**
     * Find items by source type
     */
    Page<StoreItem> findBySourceType(StoreItemSource sourceType, Pageable pageable);
    
    /**
     * Find items by fabric and product type
     */
    @Query("SELECT si FROM StoreItem si WHERE si.fabric.id = :fabricId AND si.productType.id = :productTypeId AND si.quantity > 0")
    List<StoreItem> findByFabricAndProductTypeWithStock(@Param("fabricId") Long fabricId, @Param("productTypeId") Long productTypeId);
    
    /**
     * Find all items with available stock
     */
    @Query("SELECT si FROM StoreItem si WHERE si.quantity > 0")
    Page<StoreItem> findAllWithStock(Pageable pageable);
    
    /**
     * Find items by store ID
     */
    Page<StoreItem> findByStoreId(Long storeId, Pageable pageable);
    
    /**
     * Search items by SKU pattern
     */
    @Query("SELECT si FROM StoreItem si WHERE LOWER(si.sku) LIKE LOWER(CONCAT('%', :sku, '%'))")
    Page<StoreItem> searchBySku(@Param("sku") String sku, Pageable pageable);
    
    /**
     * Get total quantity by fabric and product type
     */
    @Query("SELECT COALESCE(SUM(si.quantity), 0) FROM StoreItem si WHERE si.fabric.id = :fabricId AND si.productType.id = :productTypeId")
    Integer getTotalQuantityByFabricAndProductType(@Param("fabricId") Long fabricId, @Param("productTypeId") Long productTypeId);
    
    /**
     * Get count of items by quality
     */
    @Query("SELECT COUNT(si) FROM StoreItem si WHERE si.quality = :quality")
    Long countByQuality(@Param("quality") StoreItemQuality quality);
    
    /**
     * Get total inventory value
     */
    @Query("SELECT COALESCE(SUM(si.quantity * si.originalPrice), 0) FROM StoreItem si WHERE si.quantity > 0")
    Double getTotalInventoryValue();
}
