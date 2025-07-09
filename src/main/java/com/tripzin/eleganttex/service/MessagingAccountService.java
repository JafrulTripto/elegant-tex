package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.MessagingAccountDTO;
import com.tripzin.eleganttex.dto.MessagingAccountRequestDTO;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.Customer;
import com.tripzin.eleganttex.entity.MessagingAccount;
import com.tripzin.eleganttex.entity.User;
import com.tripzin.eleganttex.exception.BadRequestException;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.CustomerRepository;
import com.tripzin.eleganttex.repository.MessagingAccountRepository;
import com.tripzin.eleganttex.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingAccountService {
    
    private final MessagingAccountRepository messagingAccountRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final FacebookApiService facebookApiService;
    private final WhatsAppApiService whatsAppApiService;
    
    public List<MessagingAccountDTO> getUserAccounts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return messagingAccountRepository.findByUserAndIsActiveTrue(user).stream()
                .map(MessagingAccountDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public MessagingAccountDTO getAccountById(Long userId, Long accountId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        MessagingAccount account = messagingAccountRepository.findByUserAndId(user, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Messaging account not found with id: " + accountId));
        
        return MessagingAccountDTO.fromEntity(account);
    }
    
    @Transactional
    public MessagingAccountDTO createAccount(Long userId, MessagingAccountRequestDTO requestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Validate platform-specific requirements
        validatePlatformRequirements(requestDTO);
        
        // Validate access tokens
        validateAccessToken(requestDTO);
        
        // Check for duplicate accounts
        checkForDuplicateAccount(requestDTO);
        
        // Get customer if provided
        Customer customer = null;
        if (requestDTO.getCustomerId() != null) {
            customer = customerRepository.findById(requestDTO.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + requestDTO.getCustomerId()));
        }
        
        MessagingAccount account = MessagingAccount.builder()
                .user(user)
                .customer(customer)
                .platform(requestDTO.getPlatform())
                .accountName(requestDTO.getAccountName())
                .pageId(requestDTO.getPageId())
                .phoneNumberId(requestDTO.getPhoneNumberId())
                .businessAccountId(requestDTO.getBusinessAccountId())
                .accessToken(requestDTO.getAccessToken())
                .webhookVerifyToken(requestDTO.getWebhookVerifyToken())
                .isActive(requestDTO.getIsActive())
                .build();
        
        MessagingAccount savedAccount = messagingAccountRepository.save(account);
        log.info("Created messaging account: {} for user: {}", savedAccount.getId(), userId);
        
        return MessagingAccountDTO.fromEntity(savedAccount);
    }
    
    @Transactional
    public MessagingAccountDTO updateAccount(Long userId, Long accountId, MessagingAccountRequestDTO requestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        MessagingAccount account = messagingAccountRepository.findByUserAndId(user, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Messaging account not found with id: " + accountId));
        
        // Validate platform-specific requirements
        validatePlatformRequirements(requestDTO);
        
        // Check for duplicate accounts (excluding current account)
        checkForDuplicateAccountExcluding(requestDTO, accountId);
        
        // Get customer if provided
        Customer customer = null;
        if (requestDTO.getCustomerId() != null) {
            customer = customerRepository.findById(requestDTO.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + requestDTO.getCustomerId()));
        }
        
        // Update account
        account.setCustomer(customer);
        account.setPlatform(requestDTO.getPlatform());
        account.setAccountName(requestDTO.getAccountName());
        account.setPageId(requestDTO.getPageId());
        account.setPhoneNumberId(requestDTO.getPhoneNumberId());
        account.setBusinessAccountId(requestDTO.getBusinessAccountId());
        account.setAccessToken(requestDTO.getAccessToken());
        account.setWebhookVerifyToken(requestDTO.getWebhookVerifyToken());
        account.setIsActive(requestDTO.getIsActive());
        
        MessagingAccount updatedAccount = messagingAccountRepository.save(account);
        log.info("Updated messaging account: {} for user: {}", accountId, userId);
        
        return MessagingAccountDTO.fromEntity(updatedAccount);
    }
    
    @Transactional
    public MessageResponse deleteAccount(Long userId, Long accountId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        MessagingAccount account = messagingAccountRepository.findByUserAndId(user, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Messaging account not found with id: " + accountId));
        
        messagingAccountRepository.delete(account);
        log.info("Deleted messaging account: {} for user: {}", accountId, userId);
        
        return MessageResponse.success("Messaging account deleted successfully");
    }
    
    @Transactional
    public MessageResponse toggleAccountStatus(Long userId, Long accountId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        MessagingAccount account = messagingAccountRepository.findByUserAndId(user, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Messaging account not found with id: " + accountId));
        
        account.setIsActive(!account.getIsActive());
        messagingAccountRepository.save(account);
        
        String status = account.getIsActive() ? "activated" : "deactivated";
        log.info("Messaging account: {} {} for user: {}", accountId, status, userId);
        
        return MessageResponse.success("Messaging account " + status + " successfully");
    }
    
    public Page<MessagingAccountDTO> searchUserAccounts(
            Long userId,
            MessagingAccount.MessagingPlatform platform,
            Boolean isActive,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<MessagingAccount> accountPage = messagingAccountRepository.searchUserAccounts(
                user, platform, isActive, search, pageable);
        
        return accountPage.map(MessagingAccountDTO::fromEntity);
    }
    
    private void validatePlatformRequirements(MessagingAccountRequestDTO requestDTO) {
        switch (requestDTO.getPlatform()) {
            case FACEBOOK:
                if (requestDTO.getPageId() == null || requestDTO.getPageId().trim().isEmpty()) {
                    throw new BadRequestException("Page ID is required for Facebook accounts");
                }
                break;
            case WHATSAPP:
                if (requestDTO.getPhoneNumberId() == null || requestDTO.getPhoneNumberId().trim().isEmpty()) {
                    throw new BadRequestException("Phone Number ID is required for WhatsApp accounts");
                }
                if (requestDTO.getBusinessAccountId() == null || requestDTO.getBusinessAccountId().trim().isEmpty()) {
                    throw new BadRequestException("Business Account ID is required for WhatsApp accounts");
                }
                break;
        }
    }
    
    private void checkForDuplicateAccount(MessagingAccountRequestDTO requestDTO) {
        switch (requestDTO.getPlatform()) {
            case FACEBOOK:
                if (messagingAccountRepository.existsByPlatformAndPageId(
                        MessagingAccount.MessagingPlatform.FACEBOOK, requestDTO.getPageId())) {
                    throw new BadRequestException("Facebook account with this Page ID already exists");
                }
                break;
            case WHATSAPP:
                if (messagingAccountRepository.existsByPlatformAndPhoneNumberId(
                        MessagingAccount.MessagingPlatform.WHATSAPP, requestDTO.getPhoneNumberId())) {
                    throw new BadRequestException("WhatsApp account with this Phone Number ID already exists");
                }
                break;
        }
    }
    
    private void checkForDuplicateAccountExcluding(MessagingAccountRequestDTO requestDTO, Long excludeId) {
        switch (requestDTO.getPlatform()) {
            case FACEBOOK:
                messagingAccountRepository.findByPlatformAndPageId(
                        MessagingAccount.MessagingPlatform.FACEBOOK, requestDTO.getPageId())
                        .ifPresent(existing -> {
                            if (!existing.getId().equals(excludeId)) {
                                throw new BadRequestException("Facebook account with this Page ID already exists");
                            }
                        });
                break;
            case WHATSAPP:
                messagingAccountRepository.findByPlatformAndPhoneNumberId(
                        MessagingAccount.MessagingPlatform.WHATSAPP, requestDTO.getPhoneNumberId())
                        .ifPresent(existing -> {
                            if (!existing.getId().equals(excludeId)) {
                                throw new BadRequestException("WhatsApp account with this Phone Number ID already exists");
                            }
                        });
                break;
        }
    }
    
    private void validateAccessToken(MessagingAccountRequestDTO requestDTO) {
        if (requestDTO.getAccessToken() == null || requestDTO.getAccessToken().trim().isEmpty()) {
            throw new BadRequestException("Access token is required");
        }
        
        try {
            switch (requestDTO.getPlatform()) {
                case FACEBOOK:
                    boolean facebookValid = facebookApiService.validatePageAccess(
                            requestDTO.getPageId(), requestDTO.getAccessToken());
                    if (!facebookValid) {
                        throw new BadRequestException("Invalid Facebook page access token or page ID");
                    }
                    log.info("Facebook token validation successful for page: {}", requestDTO.getPageId());
                    break;
                    
                case WHATSAPP:
                    boolean whatsappValid = whatsAppApiService.validatePhoneNumberAccess(
                            requestDTO.getPhoneNumberId(), requestDTO.getAccessToken());
                    if (!whatsappValid) {
                        throw new BadRequestException("Invalid WhatsApp phone number access token or phone number ID");
                    }
                    log.info("WhatsApp token validation successful for phone: {}", requestDTO.getPhoneNumberId());
                    break;
                    
                default:
                    throw new BadRequestException("Unsupported platform: " + requestDTO.getPlatform());
            }
        } catch (BadRequestException e) {
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            log.error("Error validating access token for platform {}: {}", requestDTO.getPlatform(), e.getMessage());
            throw new BadRequestException("Failed to validate access token: " + e.getMessage());
        }
    }
}
