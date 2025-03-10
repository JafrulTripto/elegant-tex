package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.request.MarketplaceRequest;
import com.tripzin.eleganttex.dto.response.MarketplaceResponse;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.Marketplace;
import com.tripzin.eleganttex.entity.User;
import com.tripzin.eleganttex.exception.BadRequestException;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.FileStorageRepository;
import com.tripzin.eleganttex.service.FileStorageService;
import com.tripzin.eleganttex.repository.MarketplaceRepository;
import com.tripzin.eleganttex.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceService {
    
    private final MarketplaceRepository marketplaceRepository;
    private final UserRepository userRepository;
    private final FileStorageRepository fileStorageRepository;
    private final FileStorageService fileStorageService;
    
    public Page<MarketplaceResponse> getAllMarketplaces(Pageable pageable) {
        return marketplaceRepository.findAll(pageable)
                .map(MarketplaceResponse::fromEntity);
    }
    
    public MarketplaceResponse getMarketplaceById(Long id) {
        Marketplace marketplace = findMarketplaceById(id);
        return MarketplaceResponse.fromEntity(marketplace);
    }
    
    public List<MarketplaceResponse> getMarketplacesByMemberId(Long userId) {
        return marketplaceRepository.findByMembersId(userId).stream()
                .map(MarketplaceResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public MarketplaceResponse createMarketplace(MarketplaceRequest request) {
        // Validate unique name
        if (marketplaceRepository.existsByName(request.getName())) {
            throw new BadRequestException("Marketplace with this name already exists");
        }
        
        // Validate unique page URL
        if (marketplaceRepository.existsByPageUrl(request.getPageUrl())) {
            throw new BadRequestException("Marketplace with this page URL already exists");
        }
        
        Marketplace marketplace = new Marketplace();
        marketplace.setName(request.getName());
        marketplace.setPageUrl(request.getPageUrl());
        marketplace.setImageId(request.getImageId());
        
        // Add members
        Set<User> members = new HashSet<>();
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            members = request.getMemberIds().stream()
                    .map(userId -> userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId)))
                    .collect(Collectors.toSet());
        }
        marketplace.setMembers(members);
        
        Marketplace savedMarketplace = marketplaceRepository.save(marketplace);
        return MarketplaceResponse.fromEntity(savedMarketplace);
    }
    
    @Transactional
    public MarketplaceResponse updateMarketplace(Long id, MarketplaceRequest request) {
        Marketplace marketplace = findMarketplaceById(id);
        
        // Validate unique name if changed
        if (!marketplace.getName().equals(request.getName()) && 
            marketplaceRepository.existsByName(request.getName())) {
            throw new BadRequestException("Marketplace with this name already exists");
        }
        
        // Validate unique page URL if changed
        if (!marketplace.getPageUrl().equals(request.getPageUrl()) && 
            marketplaceRepository.existsByPageUrl(request.getPageUrl())) {
            throw new BadRequestException("Marketplace with this page URL already exists");
        }
        
        // Check if image is being changed
        Long oldImageId = marketplace.getImageId();
        Long newImageId = request.getImageId();
        boolean imageChanged = (oldImageId != null && !oldImageId.equals(newImageId)) || 
                              (oldImageId == null && newImageId != null);
        
        marketplace.setName(request.getName());
        marketplace.setPageUrl(request.getPageUrl());
        marketplace.setImageId(newImageId);
        
        // Update members
        if (request.getMemberIds() != null) {
            Set<User> members = request.getMemberIds().stream()
                    .map(userId -> userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId)))
                    .collect(Collectors.toSet());
            marketplace.setMembers(members);
        }
        
        Marketplace updatedMarketplace = marketplaceRepository.save(marketplace);
        
        // Try to delete the old image if it was changed and is not referenced by other marketplaces
        if (imageChanged && oldImageId != null) {
            try {
                // Check if any other marketplace is using this image
                if (!marketplaceRepository.existsByImageId(oldImageId)) {
                    fileStorageService.deleteFile(oldImageId);
                } else {
                    log.info("Old image with ID {} is still referenced by other marketplaces and will not be deleted", oldImageId);
                }
            } catch (Exception e) {
                log.error("Error deleting old marketplace image: {}", e.getMessage());
            }
        }
        
        return MarketplaceResponse.fromEntity(updatedMarketplace);
    }
    
    @Transactional
    public MessageResponse deleteMarketplace(Long id) {
        Marketplace marketplace = findMarketplaceById(id);
        Long imageId = marketplace.getImageId();
        
        // First delete the marketplace to remove the reference to the image
        marketplaceRepository.delete(marketplace);
        
        // Then try to delete the associated image if it exists
        // The FileStorageService will check if the image is still referenced by other marketplaces
        if (imageId != null) {
            try {
                // Check if any other marketplace is using this image
                if (!marketplaceRepository.existsByImageId(imageId)) {
                    fileStorageService.deleteFile(imageId);
                } else {
                    log.info("Image with ID {} is still referenced by other marketplaces and will not be deleted", imageId);
                }
            } catch (Exception e) {
                log.error("Error deleting marketplace image: {}", e.getMessage());
            }
        }
        
        return MessageResponse.success("Marketplace deleted successfully");
    }
    
    @Transactional
    public MarketplaceResponse addMember(Long marketplaceId, Long userId) {
        Marketplace marketplace = findMarketplaceById(marketplaceId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        marketplace.addMember(user);
        Marketplace updatedMarketplace = marketplaceRepository.save(marketplace);
        return MarketplaceResponse.fromEntity(updatedMarketplace);
    }
    
    @Transactional
    public MarketplaceResponse removeMember(Long marketplaceId, Long userId) {
        Marketplace marketplace = findMarketplaceById(marketplaceId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        marketplace.removeMember(user);
        Marketplace updatedMarketplace = marketplaceRepository.save(marketplace);
        return MarketplaceResponse.fromEntity(updatedMarketplace);
    }
    
    private Marketplace findMarketplaceById(Long id) {
        return marketplaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace not found with id: " + id));
    }
}
