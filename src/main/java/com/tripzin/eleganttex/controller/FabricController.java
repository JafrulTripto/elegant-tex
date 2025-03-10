package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.request.FabricRequest;
import com.tripzin.eleganttex.dto.response.FabricResponse;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.FileStorage;
import com.tripzin.eleganttex.service.FabricService;
import com.tripzin.eleganttex.service.FileStorageService;
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

import java.util.stream.Collectors;

@RestController
@RequestMapping("/fabrics")
@RequiredArgsConstructor
public class FabricController {
    
    private final FabricService fabricService;
    private final FileStorageService fileStorageService;
    
    @GetMapping
    public ResponseEntity<Page<FabricResponse>> getAllFabrics(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<FabricResponse> fabrics = fabricService.getAllFabrics(pageable);
        return ResponseEntity.ok(fabrics);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FabricResponse> getFabricById(@PathVariable Long id) {
        FabricResponse fabric = fabricService.getFabricById(id);
        return ResponseEntity.ok(fabric);
    }
    
    @PostMapping
    public ResponseEntity<FabricResponse> createFabric(@Valid @RequestBody FabricRequest request) {
        FabricResponse createdFabric = fabricService.createFabric(request);
        return ResponseEntity.ok(createdFabric);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FabricResponse> updateFabric(
            @PathVariable Long id, 
            @Valid @RequestBody FabricRequest request) {
        
        FabricResponse updatedFabric = fabricService.updateFabric(id, request);
        return ResponseEntity.ok(updatedFabric);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteFabric(@PathVariable Long id) {
        MessageResponse response = fabricService.deleteFabric(id);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FabricResponse> uploadFabricImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        // Get the fabric
        FabricResponse fabric = fabricService.getFabricById(id);
        
        // Delete old image if exists
        if (fabric.getImageId() != null) {
            fileStorageService.deleteFile(fabric.getImageId());
        }
        
        // Store new image
        FileStorage storedFile = fileStorageService.storeFile(file, "FABRIC", id);
        
        // Update fabric with new image ID
        FabricRequest updateRequest = new FabricRequest();
        updateRequest.setName(fabric.getName());
        updateRequest.setImageId(storedFile.getId());
        updateRequest.setTagNames(fabric.getTags().stream()
                .map(tag -> tag.getName())
                .collect(Collectors.toSet()));
        
        // Update fabric
        FabricResponse updatedFabric = fabricService.updateFabric(id, updateRequest);
        return ResponseEntity.ok(updatedFabric);
    }
}
