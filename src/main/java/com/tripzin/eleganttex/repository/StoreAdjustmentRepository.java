package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.StoreAdjustment;
import com.tripzin.eleganttex.entity.StoreAdjustmentStatus;
import com.tripzin.eleganttex.entity.StoreAdjustmentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreAdjustmentRepository extends JpaRepository<StoreAdjustment, Long> {
    
    /**
     * Find adjustments by status
     */
    Page<StoreAdjustment> findByStatus(StoreAdjustmentStatus status, Pageable pageable);
    
    /**
     * Find pending adjustments
     */
    @Query("SELECT sa FROM StoreAdjustment sa WHERE sa.status = 'PENDING' ORDER BY sa.requestedAt ASC")
    List<StoreAdjustment> findPendingAdjustments();
    
    /**
     * Find adjustments by requested by user ID
     */
    Page<StoreAdjustment> findByRequestedById(Long userId, Pageable pageable);
    
    /**
     * Find adjustments by approved by user ID
     */
    Page<StoreAdjustment> findByApprovedById(Long userId, Pageable pageable);
    
    /**
     * Find adjustments by store item ID
     */
    Page<StoreAdjustment> findByStoreItemId(Long storeItemId, Pageable pageable);
    
    /**
     * Find adjustments by adjustment type
     */
    Page<StoreAdjustment> findByAdjustmentType(StoreAdjustmentType adjustmentType, Pageable pageable);
    
    /**
     * Count pending adjustments
     */
    @Query("SELECT COUNT(sa) FROM StoreAdjustment sa WHERE sa.status = 'PENDING'")
    Long countPendingAdjustments();
    
    /**
     * Find recent adjustments by status
     */
    @Query("SELECT sa FROM StoreAdjustment sa WHERE sa.status = :status ORDER BY sa.requestedAt DESC")
    Page<StoreAdjustment> findRecentByStatus(@Param("status") StoreAdjustmentStatus status, Pageable pageable);
    
    /**
     * Check if adjustment exists for a source order product
     */
    boolean existsBySourceOrderProductId(Long sourceOrderProductId);
}
