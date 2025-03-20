package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.constants.RoleConstants;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.dto.response.RoleDTO;
import com.tripzin.eleganttex.entity.Permission;
import com.tripzin.eleganttex.entity.Role;
import com.tripzin.eleganttex.repository.PermissionRepository;
import com.tripzin.eleganttex.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/roles")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @GetMapping
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        List<RoleDTO> roleDTOs = roles.stream()
                .map(RoleDTO::fromEntity)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(roleDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
        return ResponseEntity.ok(RoleDTO.fromEntity(role));
    }

    @PostMapping
    public ResponseEntity<?> createRole(@Valid @RequestBody RoleRequest request) {
        // Validate role name format
        if (!RoleConstants.isValidRoleFormat(request.getName())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Role name must start with 'ROLE_'"));
        }
        
        // Check if role name already exists
        if (roleRepository.existsByName(request.getName())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Role name is already taken!"));
        }

        // Create new role
        Role role = new Role();
        role.setName(request.getName());
        role.setDescription(request.getDescription());

        // Add permissions
        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            for (Long permissionId : request.getPermissionIds()) {
                Permission permission = permissionRepository.findById(permissionId)
                        .orElseThrow(() -> new RuntimeException("Permission not found with id: " + permissionId));
                permissions.add(permission);
            }
        }
        role.setPermissions(permissions);

        roleRepository.save(role);

        return ResponseEntity.ok(new MessageResponse("Role created successfully!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @Valid @RequestBody RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));

        // Validate role name format
        if (!RoleConstants.isValidRoleFormat(request.getName())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Role name must start with 'ROLE_'"));
        }
        
        // Update role name if it's different
        if (!role.getName().equals(request.getName())) {
            if (roleRepository.existsByName(request.getName())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Role name is already taken!"));
            }
            role.setName(request.getName());
        }

        // Update description
        role.setDescription(request.getDescription());

        // Update permissions
        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            for (Long permissionId : request.getPermissionIds()) {
                Permission permission = permissionRepository.findById(permissionId)
                        .orElseThrow(() -> new RuntimeException("Permission not found with id: " + permissionId));
                permissions.add(permission);
            }
        }
        role.setPermissions(permissions);

        roleRepository.save(role);

        return ResponseEntity.ok(new MessageResponse("Role updated successfully!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));

        // Check if it's a system role
        if (RoleConstants.isSystemRole(role.getName())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Cannot delete system role!"));
        }

        roleRepository.delete(role);
        return ResponseEntity.ok(new MessageResponse("Role deleted successfully!"));
    }

    // Request DTO
    public static class RoleRequest {
        private String name;
        private String description;
        private List<Long> permissionIds;

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

        public List<Long> getPermissionIds() {
            return permissionIds;
        }

        public void setPermissionIds(List<Long> permissionIds) {
            this.permissionIds = permissionIds;
        }
    }
}
