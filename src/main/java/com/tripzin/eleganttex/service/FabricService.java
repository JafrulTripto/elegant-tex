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
    
    public FabricResponse getFabricById(Long id) {
        Fabric fabric = findFabricById(id);
        return FabricResponse.fromEntity(fabric);
    }
    
    @Transactional
    public FabricResponse createFabric(FabricRequest request) {
        Fabric fabric = new Fabric();
        fabric.setName(request.getName());
        fabric.setImageId(request.getImageId());
        
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
        fabric.setImageId(newImageId);
        
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
    
    private Fabric findFabricById(Long id) {
        return fabricRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fabric not found with id: " + id));
    }
}
