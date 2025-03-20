import { Permission, PermissionCategory } from '../types';

// Define known permission categories
const KNOWN_CATEGORIES = [
  'MARKETPLACE',
  'FABRIC',
  'CUSTOMER',
  'PRODUCT_TYPE',
  'FILE',
  'TAG',
  'ROLE',
  'DASHBOARD',
  'ORDER',
  'USER'
];

/**
 * Gets the category name from a permission name
 * @param permissionName The full permission name
 * @returns The category name
 */
export const getPermissionCategory = (permissionName: string): string => {
  // Check for known categories first
  for (const category of KNOWN_CATEGORIES) {
    if (permissionName.startsWith(category + '_')) {
      return category;
    }
  }
  
  // Fallback to simple split
  const parts = permissionName.split('_');
  if (parts.length > 0) {
    return parts[0];
  }
  return '';
};

/**
 * Gets a friendly display name for a permission by removing the category prefix
 * @param permission The permission object
 * @returns A user-friendly display name
 */
export const getPermissionDisplayName = (permission: Permission): string => {
  const category = getPermissionCategory(permission.name);
  if (category && permission.name.startsWith(category + '_')) {
    return permission.name.substring(category.length + 1);
  }
  return permission.name;
};

/**
 * Groups permissions by their category prefix (e.g., MARKETPLACE_, FABRIC_, etc.)
 * @param permissions Array of permissions to group
 * @returns Array of permission categories with their associated permissions
 */
export const groupPermissionsByCategory = (permissions: Permission[]): PermissionCategory[] => {
  if (!permissions || permissions.length === 0) {
    return [];
  }

  const categories: Record<string, Permission[]> = {};
  
  permissions.forEach(permission => {
    const categoryName = getPermissionCategory(permission.name);
    if (categoryName) {
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      categories[categoryName].push(permission);
    }
  });
  
  return Object.entries(categories)
    .map(([name, perms]) => ({
      name,
      permissions: perms
    }))
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort categories alphabetically
};

/**
 * Gets a color for a permission category
 * @param categoryName The category name
 * @returns A color string for the category
 */
export const getCategoryColor = (categoryName: string): string => {
  // Map of category names to colors
  const colorMap: Record<string, string> = {
    MARKETPLACE: 'primary',
    FABRIC: 'secondary',
    CUSTOMER: 'success',
    PRODUCT_TYPE: 'info',
    FILE: 'warning',
    TAG: 'error',
    ROLE: 'default',
    DASHBOARD: 'primary',
    ORDER: 'secondary',
    USER: 'success'
  };
  
  return colorMap[categoryName] || 'default';
};
