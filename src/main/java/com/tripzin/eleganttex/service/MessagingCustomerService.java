package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.MessagingCustomerDTO;
import com.tripzin.eleganttex.entity.MessagingAccount;
import com.tripzin.eleganttex.entity.MessagingCustomer;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.MessagingAccountRepository;
import com.tripzin.eleganttex.repository.MessagingCustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingCustomerService {
    
    private final MessagingCustomerRepository messagingCustomerRepository;
    private final MessagingAccountRepository messagingAccountRepository;
    private final FacebookApiService facebookApiService;
    
    /**
     * Get all messaging customers with filtering
     */
    public Page<MessagingCustomerDTO> getAllCustomers(String platform, String search, 
                                                     Boolean profileFetched, Pageable pageable) {
        
        MessagingCustomer.MessagingPlatform platformEnum = null;
        if (platform != null && !platform.isEmpty()) {
            platformEnum = MessagingCustomer.MessagingPlatform.valueOf(platform.toUpperCase());
        }
        
        Page<MessagingCustomer> customers = messagingCustomerRepository.searchCustomers(
                platformEnum, search, profileFetched, pageable);
        
        return customers.map(MessagingCustomerDTO::fromEntity);
    }
    
    /**
     * Get messaging customer by ID
     */
    public MessagingCustomerDTO getCustomerById(Long id) {
        MessagingCustomer customer = messagingCustomerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Messaging customer not found with id: " + id));
        
        return MessagingCustomerDTO.fromEntity(customer);
    }
    
    /**
     * Update messaging customer
     */
    @Transactional
    public MessagingCustomerDTO updateCustomer(Long id, MessagingCustomerDTO customerDTO) {
        MessagingCustomer customer = messagingCustomerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Messaging customer not found with id: " + id));
        
        // Update allowed fields
        if (customerDTO.getDisplayName() != null) {
            customer.setDisplayName(customerDTO.getDisplayName());
        }
        if (customerDTO.getFirstName() != null) {
            customer.setFirstName(customerDTO.getFirstName());
        }
        if (customerDTO.getLastName() != null) {
            customer.setLastName(customerDTO.getLastName());
        }
        if (customerDTO.getPhone() != null) {
            customer.setPhone(customerDTO.getPhone());
        }
        if (customerDTO.getEmail() != null) {
            customer.setEmail(customerDTO.getEmail());
        }
        if (customerDTO.getAddress() != null) {
            customer.setAddress(customerDTO.getAddress());
        }
        
        customer = messagingCustomerRepository.save(customer);
        log.info("Updated messaging customer: {}", id);
        
        return MessagingCustomerDTO.fromEntity(customer);
    }
    
    /**
     * Refresh customer profile from platform API
     */
    @Transactional
    public MessagingCustomerDTO refreshProfile(Long id) {
        MessagingCustomer customer = messagingCustomerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Messaging customer not found with id: " + id));
        
        try {
            if (customer.getPlatform() == MessagingCustomer.MessagingPlatform.FACEBOOK) {
                refreshFacebookProfile(customer);
            } else if (customer.getPlatform() == MessagingCustomer.MessagingPlatform.WHATSAPP) {
                // WhatsApp doesn't have a profile API for business accounts
                log.info("WhatsApp profile refresh not supported for customer: {}", id);
            }
            
            customer = messagingCustomerRepository.save(customer);
            log.info("Refreshed profile for messaging customer: {}", id);
            
        } catch (Exception e) {
            log.error("Failed to refresh profile for customer: {}", id, e);
            customer.markProfileFetchAttempted();
            messagingCustomerRepository.save(customer);
            throw new RuntimeException("Failed to refresh profile: " + e.getMessage(), e);
        }
        
        return MessagingCustomerDTO.fromEntity(customer);
    }
    
    /**
     * Get customer statistics
     */
    public Map<String, Object> getCustomerStats(String platform) {
        Map<String, Object> stats = new HashMap<>();
        
        MessagingCustomer.MessagingPlatform platformEnum = null;
        if (platform != null && !platform.isEmpty()) {
            platformEnum = MessagingCustomer.MessagingPlatform.valueOf(platform.toUpperCase());
        }
        
        // Total customers
        long totalCustomers = platformEnum != null 
                ? messagingCustomerRepository.countByPlatform(platformEnum)
                : messagingCustomerRepository.count();
        
        // Profile fetched stats
        long profilesFetched = platformEnum != null
                ? messagingCustomerRepository.countByPlatformAndProfileFetched(platformEnum, true)
                : messagingCustomerRepository.countByProfileFetched(true);
        
        long profilesNotFetched = totalCustomers - profilesFetched;
        
        // Complete profiles
        long completeProfiles = platformEnum != null
                ? messagingCustomerRepository.countCompleteProfilesByPlatform(platformEnum)
                : messagingCustomerRepository.countCompleteProfiles();
        
        // Platform breakdown (if no platform filter)
        Map<String, Long> platformBreakdown = new HashMap<>();
        if (platformEnum == null) {
            for (MessagingCustomer.MessagingPlatform p : MessagingCustomer.MessagingPlatform.values()) {
                long count = messagingCustomerRepository.countByPlatform(p);
                platformBreakdown.put(p.name(), count);
            }
        }
        
        stats.put("totalCustomers", totalCustomers);
        stats.put("profilesFetched", profilesFetched);
        stats.put("profilesNotFetched", profilesNotFetched);
        stats.put("completeProfiles", completeProfiles);
        stats.put("profileFetchRate", totalCustomers > 0 ? (double) profilesFetched / totalCustomers : 0.0);
        stats.put("profileCompleteRate", totalCustomers > 0 ? (double) completeProfiles / totalCustomers : 0.0);
        
        if (platformEnum == null) {
            stats.put("platformBreakdown", platformBreakdown);
        } else {
            stats.put("platform", platform);
        }
        
        return stats;
    }
    
    /**
     * Search messaging customers
     */
    public Page<MessagingCustomerDTO> searchCustomers(String query, String platform, 
                                                     Boolean hasCompleteProfile, Pageable pageable) {
        
        MessagingCustomer.MessagingPlatform platformEnum = null;
        if (platform != null && !platform.isEmpty()) {
            platformEnum = MessagingCustomer.MessagingPlatform.valueOf(platform.toUpperCase());
        }
        
        Page<MessagingCustomer> customers = messagingCustomerRepository.advancedSearch(
                query, platformEnum, hasCompleteProfile, pageable);
        
        return customers.map(MessagingCustomerDTO::fromEntity);
    }
    
    /**
     * Bulk refresh profiles
     */
    @Transactional
    public Map<String, Object> bulkRefreshProfiles(String platform, Boolean incompleteOnly) {
        MessagingCustomer.MessagingPlatform platformEnum = null;
        if (platform != null && !platform.isEmpty()) {
            platformEnum = MessagingCustomer.MessagingPlatform.valueOf(platform.toUpperCase());
        }
        
        List<MessagingCustomer> customers;
        if (incompleteOnly) {
            customers = platformEnum != null
                    ? messagingCustomerRepository.findIncompleteProfilesByPlatform(platformEnum)
                    : messagingCustomerRepository.findIncompleteProfiles();
        } else {
            customers = platformEnum != null
                    ? messagingCustomerRepository.findByPlatform(platformEnum)
                    : messagingCustomerRepository.findAll();
        }
        
        int totalProcessed = 0;
        int successCount = 0;
        int failureCount = 0;
        
        for (MessagingCustomer customer : customers) {
            try {
                if (customer.getPlatform() == MessagingCustomer.MessagingPlatform.FACEBOOK) {
                    refreshFacebookProfile(customer);
                    successCount++;
                } else {
                    // Skip WhatsApp as it doesn't support profile API
                    continue;
                }
                totalProcessed++;
                
                // Add small delay to avoid rate limiting
                Thread.sleep(100);
                
            } catch (Exception e) {
                log.warn("Failed to refresh profile for customer: {}", customer.getId(), e);
                customer.markProfileFetchAttempted();
                failureCount++;
                totalProcessed++;
            }
            
            messagingCustomerRepository.save(customer);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalProcessed", totalProcessed);
        result.put("successCount", successCount);
        result.put("failureCount", failureCount);
        result.put("platform", platform);
        result.put("incompleteOnly", incompleteOnly);
        
        log.info("Bulk profile refresh completed: {} processed, {} success, {} failures", 
                totalProcessed, successCount, failureCount);
        
        return result;
    }
    
    /**
     * Delete messaging customer (soft delete)
     */
    @Transactional
    public void deleteCustomer(Long id) {
        MessagingCustomer customer = messagingCustomerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Messaging customer not found with id: " + id));
        
        // In a real implementation, you might want to add a 'deleted' flag instead of hard delete
        // For now, we'll just delete the record
        messagingCustomerRepository.delete(customer);
        
        log.info("Deleted messaging customer: {}", id);
    }
    
    /**
     * Refresh Facebook profile for a customer
     */
    private void refreshFacebookProfile(MessagingCustomer customer) throws Exception {
        // Find a Facebook account to use for API calls
        List<MessagingAccount> facebookAccounts = messagingAccountRepository
                .findByPlatformAndIsActiveTrue(MessagingAccount.MessagingPlatform.FACEBOOK);
        
        if (facebookAccounts.isEmpty()) {
            throw new RuntimeException("No active Facebook accounts available for profile refresh");
        }
        
        MessagingAccount account = facebookAccounts.get(0); // Use first available account
        
        try {
            Map<String, Object> profile = facebookApiService.getUserProfile(account, customer.getPlatformCustomerId());
            
            String firstName = (String) profile.get("firstName");
            String lastName = (String) profile.get("lastName");
            String profilePictureUrl = (String) profile.get("profilePic");
            
            customer.updateProfileFromApi(firstName, lastName, profilePictureUrl);
            
        } catch (Exception e) {
            customer.markProfileFetchAttempted();
            throw e;
        }
    }
}
