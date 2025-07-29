package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.request.FabricRequest;
import com.tripzin.eleganttex.dto.response.FabricResponse;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.Fabric;
import com.tripzin.eleganttex.entity.Tag;
import com.tripzin.eleganttex.exception.BadRequestException;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.FabricRepository;
import com.tripzin.eleganttex.repository.OrderProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FabricService {
    
    private final FabricRepository fabricRepository;
    private final OrderProductRepository orderProductRepository;
    private final TagService tagService;
    private final FileStorageService fileStorageService;
    
    public Page<FabricResponse> getAllFabrics(Pageable pageable) {
        return fabricRepository.findAll(pageable)
                .map(FabricResponse::fromEntity);
    }
    
    public Page<FabricResponse> getAllFabrics(Pageable pageable, boolean activeOnly) {
        if (activeOnly) {
            return fabricRepository.findByActiveTrue(pageable)
                    .map(FabricResponse::fromEntity);
        } else {
            return getAllFabrics(pageable);
        }
    }
    
    /**
     * Search fabrics by query string
     * The search is performed on fabric name and tag names
     * 
     * @param query the search query
     * @param pageable pagination information
     * @return a page of fabric responses matching the search criteria
     */
    public Page<FabricResponse> searchFabrics(String query, Pageable pageable) {
        if (!StringUtils.hasText(query)) {
            return getAllFabrics(pageable);
        }
        
        return fabricRepository.findDistinctByNameContainingIgnoreCaseOrTags_NameContainingIgnoreCase(
                query, query, pageable)
                .map(FabricResponse::fromEntity);
    }
    
    /**
     * Search fabrics by query string with option to filter by active status
     * 
     * @param query the search query
     * @param pageable pagination information
     * @param activeOnly if true, only active fabrics will be returned
     * @return a page of fabric responses matching the search criteria
     */
    public Page<FabricResponse> searchFabrics(String query, Pageable pageable, boolean activeOnly) {
        if (!StringUtils.hasText(query)) {
            return getAllFabrics(pageable, activeOnly);
        }
        
        if (activeOnly) {
            return fabricRepository.findDistinctByNameContainingIgnoreCaseOrTags_NameContainingIgnoreCaseAndActiveTrue(
                    query, query, pageable)
                    .map(FabricResponse::fromEntity);
        } else {
            return searchFabrics(query, pageable);
        }
    }
    
    public FabricResponse getFabricById(Long id) {
        Fabric fabric = findFabricById(id);
        return FabricResponse.fromEntity(fabric);
    }
    
    @Transactional
    public FabricResponse createFabric(FabricRequest request) {
        Fabric fabric = new Fabric();
        fabric.setName(request.getName());
        fabric.setFabricCode(request.getFabricCode());
        fabric.setImageId(request.getImageId());
        fabric.setActive(request.isActive());
        
        // Process tags
        if (request.getTagNames() != null && !request.getTagNames().isEmpty()) {
            Set<Tag> tags = request.getTagNames().stream()
                    .map(tagService::getOrCreateTag)
                    .collect(Collectors.toSet());
            fabric.setTags(tags);
        }
        
        Fabric savedFabric = fabricRepository.save(fabric);
        return FabricResponse.fromEntity(savedFabric);
    }
    
    @Transactional
    public FabricResponse updateFabric(Long id, FabricRequest request) {
        Fabric fabric = findFabricById(id);
        
        // Check if image is being changed
        Long oldImageId = fabric.getImageId();
        Long newImageId = request.getImageId();
        boolean imageChanged = (oldImageId != null && !oldImageId.equals(newImageId)) || 
                              (oldImageId == null && newImageId != null);
        
        fabric.setName(request.getName());
        fabric.setFabricCode(request.getFabricCode());
        fabric.setImageId(newImageId);
        fabric.setActive(request.isActive());
        
        // Process tags
        if (request.getTagNames() != null) {
            Set<Tag> tags = request.getTagNames().stream()
                    .map(tagService::getOrCreateTag)
                    .collect(Collectors.toSet());
            fabric.setTags(tags);
        }
        
        Fabric updatedFabric = fabricRepository.save(fabric);
        
        // Try to delete the old image if it was changed and is not referenced elsewhere
        if (imageChanged && oldImageId != null) {
            try {
                if (!fabricRepository.existsByImageId(oldImageId)) {
                    fileStorageService.deleteFile(oldImageId);
                } else {
                    log.info("Old image with ID {} is still referenced by other fabrics and will not be deleted", oldImageId);
                }
            } catch (Exception e) {
                log.error("Error deleting old fabric image: {}", e.getMessage());
            }
        }
        
        return FabricResponse.fromEntity(updatedFabric);
    }
    
    @Transactional
    public MessageResponse deleteFabric(Long id) {
        Fabric fabric = findFabricById(id);
        Long imageId = fabric.getImageId();
        
        // Check if the fabric is referenced by any order products
        if (isReferencedByOrderProducts(id)) {
            throw new BadRequestException("Cannot delete fabric as it is referenced by one or more orders. " +
                    "Please remove the fabric from all orders before deleting.");
        }
        
        // First delete the fabric to remove the reference to the image
        fabricRepository.delete(fabric);
        
        // Then try to delete the associated image if it exists
        if (imageId != null) {
            try {
                if (!fabricRepository.existsByImageId(imageId)) {
                    fileStorageService.deleteFile(imageId);
                } else {
                    log.info("Image with ID {} is still referenced by other fabrics and will not be deleted", imageId);
                }
            } catch (Exception e) {
                log.error("Error deleting fabric image: {}", e.getMessage());
            }
        }
        
        return MessageResponse.success("Fabric deleted successfully");
    }
    
    /**
     * Check if a fabric is referenced by any order products
     * 
     * @param fabricId the fabric ID to check
     * @return true if the fabric is referenced by any order products, false otherwise
     */
    private boolean isReferencedByOrderProducts(Long fabricId) {
        return orderProductRepository.existsByFabricId(fabricId);
    }
    
    /**
     * Toggle the active status of a fabric
     * 
     * @param id the fabric ID
     * @return the updated fabric response
     */
    @Transactional
    public FabricResponse toggleFabricActive(Long id) {
        Fabric fabric = findFabricById(id);
        fabric.setActive(!fabric.getActive());
        Fabric updatedFabric = fabricRepository.save(fabric);
        return FabricResponse.fromEntity(updatedFabric);
    }
    
    private Fabric findFabricById(Long id) {
        return fabricRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fabric not found with id: " + id));
    }
}
