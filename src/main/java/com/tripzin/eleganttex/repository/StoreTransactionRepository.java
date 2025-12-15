package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.StoreTransaction;
import com.tripzin.eleganttex.entity.StoreTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoreTransactionRepository extends JpaRepository<StoreTransaction, Long> {
    
    /**
     * Find transactions by store item ID
     */
    Page<StoreTransaction> findByStoreItemId(Long storeItemId, Pageable pageable);
    
    /**
     * Find transactions by store item ID ordered by date descending
     */
    List<StoreTransaction> findByStoreItemIdOrderByTransactionDateDesc(Long storeItemId);
    
    /**
     * Find transactions by transaction type
     */
    Page<StoreTransaction> findByTransactionType(StoreTransactionType transactionType, Pageable pageable);
    
    /**
     * Find transactions by performed by user ID
     */
    Page<StoreTransaction> findByPerformedById(Long userId, Pageable pageable);
    
    /**
     * Find transactions within date range
     */
    @Query("SELECT st FROM StoreTransaction st WHERE st.transactionDate BETWEEN :startDate AND :endDate ORDER BY st.transactionDate DESC")
    Page<StoreTransaction> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    /**
     * Get recent transactions across all items
     */
    @Query("SELECT st FROM StoreTransaction st ORDER BY st.transactionDate DESC")
    Page<StoreTransaction> findRecentTransactions(Pageable pageable);
    
    /**
     * Count transactions by type
     */
    Long countByTransactionType(StoreTransactionType transactionType);
}
