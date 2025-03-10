package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.dto.response.PermissionDTO;
import com.tripzin.eleganttex.entity.Permission;
import com.tripzin.eleganttex.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@PreAuthorize("hasRole('ADMIN')")
public class PermissionController {

    @Autowired
    private PermissionRepository permissionRepository;

    @GetMapping
    public ResponseEntity<List<PermissionDTO>> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();
        List<PermissionDTO> permissionDTOs = permissions.stream()
                .map(PermissionDTO::fromEntity)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(permissionDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermissionDTO> getPermissionById(@PathVariable Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found with id: " + id));
        return ResponseEntity.ok(PermissionDTO.fromEntity(permission));
    }

    @PostMapping
    public ResponseEntity<?> createPermission(@Valid @RequestBody PermissionRequest request) {
        // Check if permission name already exists
        if (permissionRepository.existsByName(request.getName())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Permission name is already taken!"));
        }

        // Create new permission
        Permission permission = new Permission();
        permission.setName(request.getName());
        permission.setDescription(request.getDescription());

        permissionRepository.save(permission);

        return ResponseEntity.ok(new MessageResponse("Permission created successfully!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePermission(@PathVariable Long id, @Valid @RequestBody PermissionRequest request) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found with id: " + id));

        // Check if name is being changed and if it already exists
        if (!permission.getName().equals(request.getName()) && 
            permissionRepository.existsByName(request.getName())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Permission name is already taken!"));
        }

        // Update permission
        permission.setName(request.getName());
        permission.setDescription(request.getDescription());

        permissionRepository.save(permission);

        return ResponseEntity.ok(new MessageResponse("Permission updated successfully!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePermission(@PathVariable Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found with id: " + id));

        // Check if permission is used by any roles
        if (!permission.getRoles().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Permission is used by roles and cannot be deleted!"));
        }

        permissionRepository.delete(permission);
        return ResponseEntity.ok(new MessageResponse("Permission deleted successfully!"));
    }

    // Request DTO
    public static class PermissionRequest {
        private String name;
        private String description;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
