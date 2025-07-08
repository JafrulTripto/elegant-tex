package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.MessagingAccount;
import com.tripzin.eleganttex.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessagingAccountRepository extends JpaRepository<MessagingAccount, Long> {
    
    List<MessagingAccount> findByUserAndIsActiveTrue(User user);
    
    List<MessagingAccount> findByUser(User user);
    
    Optional<MessagingAccount> findByUserAndId(User user, Long id);
    
    Optional<MessagingAccount> findByPlatformAndPageId(MessagingAccount.MessagingPlatform platform, String pageId);
    
    Optional<MessagingAccount> findByPlatformAndPhoneNumberId(MessagingAccount.MessagingPlatform platform, String phoneNumberId);
    
    List<MessagingAccount> findByPlatformAndIsActiveTrue(MessagingAccount.MessagingPlatform platform);
    
    @Query("SELECT ma FROM MessagingAccount ma WHERE " +
           "ma.user = :user AND " +
           "(:platform IS NULL OR ma.platform = :platform) AND " +
           "(:isActive IS NULL OR ma.isActive = :isActive) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(ma.accountName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(ma.pageId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(ma.phoneNumberId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MessagingAccount> searchUserAccounts(
        @Param("user") User user,
        @Param("platform") MessagingAccount.MessagingPlatform platform,
        @Param("isActive") Boolean isActive,
        @Param("search") String search,
        Pageable pageable);
    
    long countByUserAndIsActiveTrue(User user);
    
    boolean existsByPlatformAndPageId(MessagingAccount.MessagingPlatform platform, String pageId);
    
    boolean existsByPlatformAndPhoneNumberId(MessagingAccount.MessagingPlatform platform, String phoneNumberId);
    
    boolean existsByPlatformAndWebhookVerifyToken(MessagingAccount.MessagingPlatform platform, String webhookVerifyToken);
}
