package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Message;
import com.tripzin.eleganttex.entity.MessageNotification;
import com.tripzin.eleganttex.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageNotificationRepository extends JpaRepository<MessageNotification, Long> {
    
    List<MessageNotification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    
    Page<MessageNotification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    long countByUserAndIsReadFalse(User user);
    
    List<MessageNotification> findByMessage(Message message);
    
    @Modifying
    @Query("UPDATE MessageNotification mn SET mn.isRead = true WHERE mn.user = :user AND mn.isRead = false")
    void markAllAsReadForUser(@Param("user") User user);
    
    @Modifying
    @Query("UPDATE MessageNotification mn SET mn.isRead = true WHERE mn.id IN :ids")
    void markAsRead(@Param("ids") List<Long> ids);
    
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
    
    boolean existsByUserAndMessage(User user, Message message);
}
