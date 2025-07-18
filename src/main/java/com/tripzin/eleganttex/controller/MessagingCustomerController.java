package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.MessagingCustomerDTO;
import com.tripzin.eleganttex.service.MessagingCustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/messaging/customers")
@RequiredArgsConstructor
@Tag(name = "Messaging Customers", description = "Messaging customer management endpoints")
public class MessagingCustomerController {
    
    private final MessagingCustomerService messagingCustomerService;
    
    @GetMapping
    @Operation(summary = "Get all messaging customers", description = "Retrieve paginated list of messaging customers with filtering")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Page<MessagingCustomerDTO>> getAllCustomers(
            @Parameter(description = "Filter by platform") @RequestParam(required = false) String platform,
            @Parameter(description = "Search by name or phone") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by profile fetched status") @RequestParam(required = false) Boolean profileFetched,
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<MessagingCustomerDTO> customers = messagingCustomerService.getAllCustomers(
                platform, search, profileFetched, pageable);
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get messaging customer by ID", description = "Retrieve a specific messaging customer")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<MessagingCustomerDTO> getCustomerById(
            @Parameter(description = "Customer ID") @PathVariable Long id) {
        
        MessagingCustomerDTO customer = messagingCustomerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update messaging customer", description = "Update messaging customer information")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<MessagingCustomerDTO> updateCustomer(
            @Parameter(description = "Customer ID") @PathVariable Long id,
            @RequestBody MessagingCustomerDTO customerDTO) {
        
        MessagingCustomerDTO updatedCustomer = messagingCustomerService.updateCustomer(id, customerDTO);
        return ResponseEntity.ok(updatedCustomer);
    }
    
    @PostMapping("/{id}/refresh-profile")
    @Operation(summary = "Refresh customer profile", description = "Trigger profile refresh from platform API")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<MessagingCustomerDTO> refreshProfile(
            @Parameter(description = "Customer ID") @PathVariable Long id) {
        
        MessagingCustomerDTO customer = messagingCustomerService.refreshProfile(id);
        return ResponseEntity.ok(customer);
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Get customer statistics", description = "Get messaging customer statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> getCustomerStats(
            @Parameter(description = "Filter by platform") @RequestParam(required = false) String platform) {
        
        Map<String, Object> stats = messagingCustomerService.getCustomerStats(platform);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search messaging customers", description = "Advanced search for messaging customers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Page<MessagingCustomerDTO>> searchCustomers(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Filter by platform") @RequestParam(required = false) String platform,
            @Parameter(description = "Filter by profile completeness") @RequestParam(required = false) Boolean hasCompleteProfile,
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<MessagingCustomerDTO> customers = messagingCustomerService.searchCustomers(
                query, platform, hasCompleteProfile, pageable);
        return ResponseEntity.ok(customers);
    }
    
    @PostMapping("/bulk-refresh")
    @Operation(summary = "Bulk refresh profiles", description = "Trigger profile refresh for multiple customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkRefreshProfiles(
            @Parameter(description = "Filter by platform") @RequestParam(required = false) String platform,
            @Parameter(description = "Only refresh incomplete profiles") @RequestParam(defaultValue = "true") Boolean incompleteOnly) {
        
        Map<String, Object> result = messagingCustomerService.bulkRefreshProfiles(platform, incompleteOnly);
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete messaging customer", description = "Delete a messaging customer (soft delete)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(
            @Parameter(description = "Customer ID") @PathVariable Long id) {
        
        messagingCustomerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
