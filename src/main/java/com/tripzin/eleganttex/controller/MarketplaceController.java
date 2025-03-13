package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.request.MarketplaceRequest;
import com.tripzin.eleganttex.dto.response.MarketplaceResponse;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.FileStorage;
import com.tripzin.eleganttex.service.FileStorageService;
import com.tripzin.eleganttex.service.MarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/marketplaces")
@RequiredArgsConstructor
@Slf4j
public class MarketplaceController {
    
    private final MarketplaceService marketplaceService;
    private final FileStorageService fileStorageService;
    
    @GetMapping
    public ResponseEntity<Page<MarketplaceResponse>> getAllMarketplaces(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<MarketplaceResponse> marketplaces;
        if (query != null && !query.trim().isEmpty()) {
            marketplaces = marketplaceService.searchMarketplaces(query, pageable, activeOnly);
        } else {
            marketplaces = marketplaceService.getAllMarketplaces(pageable, activeOnly);
        }
        
        return ResponseEntity.ok(marketplaces);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<MarketplaceResponse>> searchMarketplaces(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<MarketplaceResponse> marketplaces = marketplaceService.searchMarketplaces(query, pageable, activeOnly);
        return ResponseEntity.ok(marketplaces);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceResponse> getMarketplaceById(@PathVariable Long id) {
        MarketplaceResponse marketplace = marketplaceService.getMarketplaceById(id);
        return ResponseEntity.ok(marketplace);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MarketplaceResponse>> getMarketplacesByMemberId(@PathVariable Long userId) {
        List<MarketplaceResponse> marketplaces = marketplaceService.getMarketplacesByMemberId(userId);
        return ResponseEntity.ok(marketplaces);
    }
    
    @PostMapping
    public ResponseEntity<MarketplaceResponse> createMarketplace(@Valid @RequestBody MarketplaceRequest request) {
        MarketplaceResponse createdMarketplace = marketplaceService.createMarketplace(request);
        return ResponseEntity.ok(createdMarketplace);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MarketplaceResponse> updateMarketplace(
            @PathVariable Long id, 
            @Valid @RequestBody MarketplaceRequest request) {
        
        MarketplaceResponse updatedMarketplace = marketplaceService.updateMarketplace(id, request);
        return ResponseEntity.ok(updatedMarketplace);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteMarketplace(@PathVariable Long id) {
        MessageResponse response = marketplaceService.deleteMarketplace(id);
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<MarketplaceResponse> toggleMarketplaceActive(@PathVariable Long id) {
        MarketplaceResponse updatedMarketplace = marketplaceService.toggleMarketplaceActive(id);
        return ResponseEntity.ok(updatedMarketplace);
    }
    
    @PostMapping("/{id}/members/{userId}")
    public ResponseEntity<MarketplaceResponse> addMember(
            @PathVariable Long id, 
            @PathVariable Long userId) {
        
        MarketplaceResponse updatedMarketplace = marketplaceService.addMember(id, userId);
        return ResponseEntity.ok(updatedMarketplace);
    }
    
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<MarketplaceResponse> removeMember(
            @PathVariable Long id, 
            @PathVariable Long userId) {
        
        MarketplaceResponse updatedMarketplace = marketplaceService.removeMember(id, userId);
        return ResponseEntity.ok(updatedMarketplace);
    }
    
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MarketplaceResponse> uploadMarketplaceImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        // Get the marketplace
        MarketplaceResponse marketplace = marketplaceService.getMarketplaceById(id);
        
        // Save the old image ID for later deletion
        Long oldImageId = marketplace.getImageId();
        
        // Store new image first
        FileStorage storedFile = fileStorageService.storeFile(file, "MARKETPLACE", id);
        
        // Update marketplace with new image ID
        MarketplaceRequest updateRequest = new MarketplaceRequest();
        updateRequest.setName(marketplace.getName());
        updateRequest.setPageUrl(marketplace.getPageUrl());
        updateRequest.setImageId(storedFile.getId());
        updateRequest.setMemberIds(marketplace.getMembers().stream()
                .map(member -> member.getId())
                .collect(Collectors.toSet()));
        
        // Update marketplace
        MarketplaceResponse updatedMarketplace = marketplaceService.updateMarketplace(id, updateRequest);
        
        // Now that the marketplace has been updated with the new image ID,
        // we can safely delete the old image if it exists
        if (oldImageId != null) {
            try {
                fileStorageService.deleteFile(oldImageId);
            } catch (Exception e) {
                // Log the error but don't fail the request
                // The marketplace has already been updated successfully
                log.error("Error deleting old marketplace image: {}", e.getMessage());
            }
        }
        
        return ResponseEntity.ok(updatedMarketplace);
    }
}
