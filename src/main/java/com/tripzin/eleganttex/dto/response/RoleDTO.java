package com.tripzin.eleganttex.dto.response;

import com.tripzin.eleganttex.entity.Role;

import java.util.List;
import java.util.stream.Collectors;

public class RoleDTO {
    private Long id;
    private String name;
    private String description;
    private List<PermissionDTO> permissions;

    public RoleDTO() {
    }

    public RoleDTO(Long id, String name, String description, List<PermissionDTO> permissions) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.permissions = permissions;
    }

    public static RoleDTO fromEntity(Role role) {
        List<PermissionDTO> permissionDTOs = role.getPermissions().stream()
                .map(permission -> new PermissionDTO(
                        permission.getId(),
                        permission.getName(),
                        permission.getDescription(),
                        null)) // Avoid circular reference
                .collect(Collectors.toList());

        return new RoleDTO(
                role.getId(),
                role.getName(),
                role.getDescription(),
                permissionDTOs
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public List<PermissionDTO> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<PermissionDTO> permissions) {
        this.permissions = permissions;
    }
}
