package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.request.AdjustQuantityRequest;
import com.tripzin.eleganttex.dto.request.ManualStoreItemRequest;
import com.tripzin.eleganttex.dto.request.RejectAdjustmentRequest;
import com.tripzin.eleganttex.dto.request.UpdateQualityRequest;
import com.tripzin.eleganttex.dto.request.UseItemRequest;
import com.tripzin.eleganttex.dto.response.StoreItemResponse;
import com.tripzin.eleganttex.dto.response.StoreAdjustmentResponse;
import com.tripzin.eleganttex.dto.response.StoreStatisticsResponse;
import com.tripzin.eleganttex.entity.StoreItemQuality;
import com.tripzin.eleganttex.entity.StoreItemSource;
import com.tripzin.eleganttex.security.services.UserDetailsImpl;
import com.tripzin.eleganttex.service.StoreItemService;
import com.tripzin.eleganttex.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;
    private final StoreItemService storeItemService;

    // Helper to get current user id from security context
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl user) {
            return user.getId();
        }
        return null;
    }

    // Items
    @GetMapping("/items")
    @PreAuthorize("hasAuthority('STORE_READ')")
    public Page<StoreItemResponse> listItems(
            @RequestParam(required = false) Long fabricId,
            @RequestParam(required = false) Long productTypeId,
            @RequestParam(required = false) String quality,
            @RequestParam(required = false) String sourceType,
            @RequestParam(required = false) String sku,
            @RequestParam(required = false, defaultValue = "false") Boolean onlyWithStock,
            Pageable pageable
    ) {
        StoreItemQuality q = null;
        if (quality != null && !quality.isBlank()) {
            try { q = StoreItemQuality.valueOf(quality.toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }
        StoreItemSource s = null;
        if (sourceType != null && !sourceType.isBlank()) {
            try { s = StoreItemSource.valueOf(sourceType.toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }
        return storeItemService.searchItems(fabricId, productTypeId, q, s, sku, onlyWithStock, pageable);
    }

    @GetMapping("/items/{id}")
    @PreAuthorize("hasAuthority('STORE_READ')")
    public StoreItemResponse getItem(@PathVariable Long id) {
        return storeItemService.getItemById(id);
    }

    @GetMapping("/items/sku/{sku}")
    @PreAuthorize("hasAuthority('STORE_READ')")
    public StoreItemResponse getItemBySku(@PathVariable String sku) {
        return storeItemService.getItemBySku(sku);
    }

    @GetMapping("/items/by-order/{orderNumber}")
    @PreAuthorize("hasAuthority('STORE_READ')")
    public Page<StoreItemResponse> getItemsByOrder(@PathVariable String orderNumber, Pageable pageable) {
        return storeItemService.getItemsByOrderNumber(orderNumber, pageable);
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasAuthority('STORE_DELETE')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        storeItemService.deleteItem(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    // Manual entry + approvals
    @PostMapping("/items/manual")
    @PreAuthorize("hasAuthority('STORE_CREATE')")
    public Map<String, Long> createManualItem(@RequestBody ManualStoreItemRequest request) {
        Long adjustmentId = storeService.addManualItem(request, getCurrentUserId());
        return Map.of("adjustmentId", adjustmentId);
    }

    @PostMapping("/adjustments/{id}/approve")
    @PreAuthorize("hasAuthority('STORE_APPROVE')")
    public StoreItemResponse approveAdjustment(@PathVariable("id") Long adjustmentId) {
        return storeService.approveAdjustment(adjustmentId, getCurrentUserId());
    }

    @PostMapping("/adjustments/{id}/reject")
    @PreAuthorize("hasAuthority('STORE_APPROVE')")
    public ResponseEntity<Void> rejectAdjustment(@PathVariable("id") Long adjustmentId,
                                                 @RequestBody RejectAdjustmentRequest request) {
        storeService.rejectAdjustment(adjustmentId, getCurrentUserId(), request.getReason());
        return ResponseEntity.noContent().build();
    }

    // Item operations
    @PostMapping("/items/{id}/quality")
    @PreAuthorize("hasAuthority('STORE_UPDATE')")
    public StoreItemResponse updateQuality(@PathVariable Long id, @RequestBody UpdateQualityRequest request) {
        StoreItemQuality q = StoreItemQuality.fromString(request.getQuality());
        return storeService.updateItemQuality(id, q, request.getNotes(), getCurrentUserId());
    }

    @PostMapping("/items/{id}/adjust")
    @PreAuthorize("hasAuthority('STORE_UPDATE')")
    public StoreItemResponse adjustQuantity(@PathVariable Long id, @RequestBody AdjustQuantityRequest request) {
        return storeService.adjustQuantity(id, request.getQuantityChange(), request.getNotes(), getCurrentUserId());
    }

    @PostMapping("/items/{id}/use")
    @PreAuthorize("hasAuthority('STORE_UPDATE')")
    public StoreItemResponse useItem(@PathVariable Long id, @RequestBody UseItemRequest request) {
        return storeService.useItem(id, request.getQuantity(), request.getNotes(), getCurrentUserId());
    }

    @PostMapping("/items/{id}/write-off")
    @PreAuthorize("hasAuthority('STORE_UPDATE')")
    public ResponseEntity<Void> writeOff(@PathVariable Long id, @RequestBody(required = false) UseItemRequest request) {
        String notes = request != null ? request.getNotes() : null;
        storeService.writeOffItem(id, notes, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    // Adjustments listing
    @GetMapping("/adjustments")
    @PreAuthorize("hasAuthority('STORE_APPROVE')")
    public Page<StoreAdjustmentResponse> listAdjustments(@RequestParam(defaultValue = "PENDING") String status,
                                                         Pageable pageable) {
        com.tripzin.eleganttex.entity.StoreAdjustmentStatus s;
        try { s = com.tripzin.eleganttex.entity.StoreAdjustmentStatus.valueOf(status.toUpperCase()); }
        catch (IllegalArgumentException e) { s = com.tripzin.eleganttex.entity.StoreAdjustmentStatus.PENDING; }
        return storeService.getAdjustments(s, pageable);
    }

    // Statistics / availability
    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('STORE_READ')")
    public StoreStatisticsResponse statistics() {
        return storeService.getStoreStatistics();
    }

    @GetMapping("/available")
    @PreAuthorize("hasAuthority('STORE_READ')")
    public Map<String, Object> availableForProduct(@RequestParam Long fabricId, @RequestParam Long productTypeId) {
        return storeService.getAvailableItemsForProduct(fabricId, productTypeId);
    }
}
