package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Conversation;
import com.tripzin.eleganttex.entity.Customer;
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
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    List<Conversation> findByMessagingAccountAndIsActiveTrueOrderByLastMessageAtDesc(MessagingAccount messagingAccount);
    
    List<Conversation> findByCustomerOrderByLastMessageAtDesc(Customer customer);
    
    Optional<Conversation> findByMessagingAccountAndPlatformCustomerId(MessagingAccount messagingAccount, String platformCustomerId);
    
    Page<Conversation> findByMessagingAccountAndIsActiveTrueOrderByLastMessageAtDesc(MessagingAccount messagingAccount, Pageable pageable);
    
    @Query("SELECT c FROM Conversation c WHERE " +
           "c.messagingAccount IN :accounts AND " +
           "c.isActive = true AND " +
           "(:hasUnread IS NULL OR " +
           "(:hasUnread = true AND c.unreadCount > 0) OR " +
           "(:hasUnread = false AND c.unreadCount = 0)) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(c.conversationName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.platformCustomerId) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY c.lastMessageAt DESC")
    Page<Conversation> searchConversations(
        @Param("accounts") List<MessagingAccount> accounts,
        @Param("hasUnread") Boolean hasUnread,
        @Param("search") String search,
        Pageable pageable);
    
    @Query("SELECT SUM(c.unreadCount) FROM Conversation c WHERE c.messagingAccount IN :accounts AND c.isActive = true")
    Long getTotalUnreadCount(@Param("accounts") List<MessagingAccount> accounts);
    
    List<Conversation> findByMessagingAccountInAndLastMessageAtAfter(List<MessagingAccount> accounts, LocalDateTime since);
    
    long countByMessagingAccountAndUnreadCountGreaterThan(MessagingAccount messagingAccount, Integer count);
    
    long countByMessagingAccount(MessagingAccount messagingAccount);
}
