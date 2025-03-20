package com.tripzin.eleganttex.constants;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Constants for role names and utility methods for role validation
 */
public class RoleConstants {
    
    // Standard role names
    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_MODERATOR = "ROLE_MODERATOR";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_MANAGER = "ROLE_MANAGER";
    
    // Set of system roles that cannot be deleted
    private static final Set<String> SYSTEM_ROLES = new HashSet<>(
            Arrays.asList(ROLE_USER, ROLE_MODERATOR, ROLE_ADMIN)
    );
    
    /**
     * Check if a role name is a system role that cannot be deleted
     * 
     * @param roleName the role name to check
     * @return true if the role is a system role
     */
    public static boolean isSystemRole(String roleName) {
        return SYSTEM_ROLES.contains(roleName);
    }
    
    /**
     * Validate that a role name follows the required format (starts with "ROLE_")
     * 
     * @param roleName the role name to validate
     * @return true if the role name is valid
     */
    public static boolean isValidRoleFormat(String roleName) {
        return roleName != null && roleName.startsWith("ROLE_");
    }
    
    /**
     * Format a role name to ensure it has the ROLE_ prefix
     * 
     * @param roleName the role name to format
     * @return the formatted role name
     */
    public static String formatRoleName(String roleName) {
        if (roleName == null) {
            return null;
        }
        
        return roleName.startsWith("ROLE_") ? 
            roleName : "ROLE_" + roleName.toUpperCase();
    }
}
