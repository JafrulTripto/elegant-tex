package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.request.MarketplaceRequest;
import com.tripzin.eleganttex.dto.response.MarketplaceResponse;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.FileStorage;
import com.tripzin.eleganttex.service.FileStorageService;
import com.tripzin.eleganttex.service.MarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
public class MarketplaceController {
    
    private final MarketplaceService marketplaceService;
    private final FileStorageService fileStorageService;
    
    @GetMapping
    public ResponseEntity<Page<MarketplaceResponse>> getAllMarketplaces(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<MarketplaceResponse> marketplaces = marketplaceService.getAllMarketplaces(pageable);
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
        
        // Delete old image if exists
        if (marketplace.getImageId() != null) {
            fileStorageService.deleteFile(marketplace.getImageId());
        }
        
        // Store new image
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
        return ResponseEntity.ok(updatedMarketplace);
    }
}
