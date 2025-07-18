package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.MessagingCustomer;
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
public interface MessagingCustomerRepository extends JpaRepository<MessagingCustomer, Long> {
    
    /**
     * Find messaging customer by platform customer ID and platform
     */
    Optional<MessagingCustomer> findByPlatformCustomerIdAndPlatform(
            String platformCustomerId, 
            MessagingCustomer.MessagingPlatform platform
    );
    
    /**
     * Find all messaging customers for a specific platform
     */
    List<MessagingCustomer> findByPlatform(MessagingCustomer.MessagingPlatform platform);
    
    /**
     * Find messaging customers with incomplete profiles that should be retried
     */
    @Query("SELECT mc FROM MessagingCustomer mc WHERE " +
           "mc.profileFetched = false AND " +
           "(mc.profileFetchAttemptedAt IS NULL OR mc.profileFetchAttemptedAt < :retryAfter)")
    List<MessagingCustomer> findCustomersForProfileRetry(@Param("retryAfter") LocalDateTime retryAfter);
    
    /**
     * Find messaging customers by phone number
     */
    List<MessagingCustomer> findByPhoneContaining(String phone);
    
    /**
     * Find messaging customers by email
     */
    List<MessagingCustomer> findByEmailContaining(String email);
    
    /**
     * Find messaging customers with contact information
     */
    @Query("SELECT mc FROM MessagingCustomer mc WHERE " +
           "(mc.phone IS NOT NULL AND mc.phone != '') OR " +
           "(mc.email IS NOT NULL AND mc.email != '')")
    List<MessagingCustomer> findCustomersWithContactInfo();
    
    /**
     * Find messaging customers with complete profiles
     */
    @Query("SELECT mc FROM MessagingCustomer mc WHERE " +
           "mc.profileFetched = true AND " +
           "mc.firstName IS NOT NULL AND " +
           "mc.lastName IS NOT NULL")
    List<MessagingCustomer> findCustomersWithCompleteProfiles();
    
    /**
     * Search messaging customers by display name
     */
    @Query("SELECT mc FROM MessagingCustomer mc WHERE " +
           "LOWER(mc.displayName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(mc.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(mc.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<MessagingCustomer> searchByName(@Param("searchTerm") String searchTerm);
    
    /**
     * Count messaging customers by platform
     */
    long countByPlatform(MessagingCustomer.MessagingPlatform platform);
    
    /**
     * Count messaging customers with fetched profiles
     */
    long countByProfileFetched(boolean profileFetched);
    
    /**
     * Count messaging customers by platform and profile fetched status
     */
    long countByPlatformAndProfileFetched(MessagingCustomer.MessagingPlatform platform, boolean profileFetched);
    
    /**
     * Count complete profiles
     */
    @Query("SELECT COUNT(mc) FROM MessagingCustomer mc WHERE " +
           "mc.profileFetched = true AND " +
           "mc.firstName IS NOT NULL AND " +
           "mc.lastName IS NOT NULL")
    long countCompleteProfiles();
    
    /**
     * Count complete profiles by platform
     */
    @Query("SELECT COUNT(mc) FROM MessagingCustomer mc WHERE " +
           "mc.platform = :platform AND " +
           "mc.profileFetched = true AND " +
           "mc.firstName IS NOT NULL AND " +
           "mc.lastName IS NOT NULL")
    long countCompleteProfilesByPlatform(@Param("platform") MessagingCustomer.MessagingPlatform platform);
    
    /**
     * Find incomplete profiles
     */
    @Query("SELECT mc FROM MessagingCustomer mc WHERE " +
           "mc.profileFetched = false OR " +
           "mc.firstName IS NULL OR " +
           "mc.lastName IS NULL")
    List<MessagingCustomer> findIncompleteProfiles();
    
    /**
     * Find incomplete profiles by platform
     */
    @Query("SELECT mc FROM MessagingCustomer mc WHERE " +
           "mc.platform = :platform AND (" +
           "mc.profileFetched = false OR " +
           "mc.firstName IS NULL OR " +
           "mc.lastName IS NULL)")
    List<MessagingCustomer> findIncompleteProfilesByPlatform(@Param("platform") MessagingCustomer.MessagingPlatform platform);
    
    /**
     * Search messaging customers with filters
     */
    @Query("SELECT mc FROM MessagingCustomer mc WHERE " +
           "(:platform IS NULL OR mc.platform = :platform) AND " +
           "(:search IS NULL OR " +
           " LOWER(mc.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(mc.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(mc.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " mc.phone LIKE CONCAT('%', :search, '%') OR " +
           " LOWER(mc.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:profileFetched IS NULL OR mc.profileFetched = :profileFetched)")
    Page<MessagingCustomer> searchCustomers(
            @Param("platform") MessagingCustomer.MessagingPlatform platform,
            @Param("search") String search,
            @Param("profileFetched") Boolean profileFetched,
            Pageable pageable);
    
    /**
     * Advanced search for messaging customers
     */
    @Query("SELECT mc FROM MessagingCustomer mc WHERE " +
           "(:query IS NULL OR " +
           " LOWER(mc.displayName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(mc.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(mc.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " mc.phone LIKE CONCAT('%', :query, '%') OR " +
           " LOWER(mc.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " mc.platformCustomerId LIKE CONCAT('%', :query, '%')) AND " +
           "(:platform IS NULL OR mc.platform = :platform) AND " +
           "(:hasCompleteProfile IS NULL OR " +
           " (:hasCompleteProfile = true AND mc.profileFetched = true AND mc.firstName IS NOT NULL AND mc.lastName IS NOT NULL) OR " +
           " (:hasCompleteProfile = false AND (mc.profileFetched = false OR mc.firstName IS NULL OR mc.lastName IS NULL)))")
    Page<MessagingCustomer> advancedSearch(
            @Param("query") String query,
            @Param("platform") MessagingCustomer.MessagingPlatform platform,
            @Param("hasCompleteProfile") Boolean hasCompleteProfile,
            Pageable pageable);
    
    /**
     * Find messaging customers created within a date range
     */
    List<MessagingCustomer> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Check if a messaging customer exists for the given platform customer ID and platform
     */
    boolean existsByPlatformCustomerIdAndPlatform(
            String platformCustomerId, 
            MessagingCustomer.MessagingPlatform platform
    );
}
