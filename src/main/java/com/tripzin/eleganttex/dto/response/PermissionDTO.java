package com.tripzin.eleganttex.dto.response;

import com.tripzin.eleganttex.entity.Permission;

import java.util.List;
import java.util.stream.Collectors;

public class PermissionDTO {
    private Long id;
    private String name;
    private String description;
    private List<String> roleNames;

    public PermissionDTO() {
    }

    public PermissionDTO(Long id, String name, String description, List<String> roleNames) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.roleNames = roleNames;
    }

    public static PermissionDTO fromEntity(Permission permission) {
        List<String> roleNames = permission.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return new PermissionDTO(
                permission.getId(),
                permission.getName(),
                permission.getDescription(),
                roleNames
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

    public List<String> getRoleNames() {
        return roleNames;
    }

    public void setRoleNames(List<String> roleNames) {
        this.roleNames = roleNames;
    }
}
