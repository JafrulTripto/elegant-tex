package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.MessagingAccountDTO;
import com.tripzin.eleganttex.dto.MessagingAccountRequestDTO;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.MessagingAccount;
import com.tripzin.eleganttex.security.services.UserDetailsImpl;
import com.tripzin.eleganttex.service.MessagingAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messaging/accounts")
@RequiredArgsConstructor
public class MessagingAccountController {
    
    private final MessagingAccountService messagingAccountService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MessagingAccountDTO>> getUserAccounts(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(messagingAccountService.getUserAccounts(currentUser.getId()));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessagingAccountDTO> getAccountById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(messagingAccountService.getAccountById(currentUser.getId(), id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessagingAccountDTO> createAccount(
            @Valid @RequestBody MessagingAccountRequestDTO requestDTO,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        MessagingAccountDTO createdAccount = messagingAccountService.createAccount(currentUser.getId(), requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAccount);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessagingAccountDTO> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody MessagingAccountRequestDTO requestDTO,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(messagingAccountService.updateAccount(currentUser.getId(), id, requestDTO));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(messagingAccountService.deleteAccount(currentUser.getId(), id));
    }
    
    @PostMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> toggleAccountStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(messagingAccountService.toggleAccountStatus(currentUser.getId(), id));
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<MessagingAccountDTO>> searchUserAccounts(
            @RequestParam(required = false) MessagingAccount.MessagingPlatform platform,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        
        return ResponseEntity.ok(messagingAccountService.searchUserAccounts(
                currentUser.getId(), platform, isActive, search, page, size, sortBy, sortDir));
    }
}
