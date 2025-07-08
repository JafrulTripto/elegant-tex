package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.MessagingAccount;
import com.tripzin.eleganttex.entity.WebhookEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEvent, Long> {
    
    List<WebhookEvent> findByProcessedFalseOrderByCreatedAtAsc();
    
    List<WebhookEvent> findByMessagingAccountAndProcessedFalseOrderByCreatedAtAsc(MessagingAccount messagingAccount);
    
    Page<WebhookEvent> findByMessagingAccountOrderByCreatedAtDesc(MessagingAccount messagingAccount, Pageable pageable);
    
    @Query("SELECT we FROM WebhookEvent we WHERE " +
           "(:platform IS NULL OR we.platform = :platform) AND " +
           "(:processed IS NULL OR we.processed = :processed) AND " +
           "(:eventType IS NULL OR :eventType = '' OR we.eventType = :eventType) AND " +
           "we.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY we.createdAt DESC")
    Page<WebhookEvent> searchEvents(
        @Param("platform") MessagingAccount.MessagingPlatform platform,
        @Param("processed") Boolean processed,
        @Param("eventType") String eventType,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable);
    
    long countByProcessedFalse();
    
    long countByPlatformAndProcessedFalse(MessagingAccount.MessagingPlatform platform);
    
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
}
