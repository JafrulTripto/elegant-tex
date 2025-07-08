package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Conversation;
import com.tripzin.eleganttex.entity.Message;
import com.tripzin.eleganttex.entity.MessagingAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByConversationOrderByTimestampDesc(Conversation conversation);
    
    Page<Message> findByConversationOrderByTimestampDesc(Conversation conversation, Pageable pageable);
    
    Optional<Message> findByPlatformMessageId(String platformMessageId);
    
    List<Message> findByMessagingAccountAndTimestampAfterOrderByTimestampDesc(MessagingAccount account, LocalDateTime since);
    
    @Query("SELECT m FROM Message m WHERE " +
           "m.conversation IN :conversations AND " +
           "(:messageType IS NULL OR m.messageType = :messageType) AND " +
           "(:isInbound IS NULL OR m.isInbound = :isInbound) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(m.content) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY m.timestamp DESC")
    Page<Message> searchMessages(
        @Param("conversations") List<Conversation> conversations,
        @Param("messageType") Message.MessageType messageType,
        @Param("isInbound") Boolean isInbound,
        @Param("search") String search,
        Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation = :conversation AND m.isInbound = true AND m.status != 'READ'")
    long countUnreadInboundMessages(@Param("conversation") Conversation conversation);
    
    List<Message> findTop10ByConversationOrderByTimestampDesc(Conversation conversation);
    
    @Query("SELECT m FROM Message m WHERE m.messagingAccount IN :accounts AND m.timestamp BETWEEN :startDate AND :endDate ORDER BY m.timestamp DESC")
    List<Message> findMessagesBetweenDates(
        @Param("accounts") List<MessagingAccount> accounts,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    long countByMessagingAccountAndIsInboundAndTimestampAfter(MessagingAccount account, Boolean isInbound, LocalDateTime since);
}
