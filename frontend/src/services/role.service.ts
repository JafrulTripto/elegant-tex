import api from './api';
import { RoleFilterParams, Permission } from '../types';

class RoleService {
  /**
   * Get all roles
   */
  getAllRoles = async () => {
    return api.get('/roles');
  };

  /**
   * Get role by ID
   */
  getRoleById = async (id: number) => {
    return api.get(`/roles/${id}`);
  };

  /**
   * Create a new role
   */
  createRole = async (roleData: any) => {
    return api.post('/roles', roleData);
  };

  /**
   * Update an existing role
   */
  updateRole = async (id: number, roleData: any) => {
    return api.put(`/roles/${id}`, roleData);
  };

  /**
   * Delete a role
   */
  deleteRole = async (id: number) => {
    return api.delete(`/roles/${id}`);
  };

  /**
   * Search roles with filters
   * Note: This uses the standard roles endpoint since a dedicated search endpoint is not available
   */
  searchRoles = async (params: RoleFilterParams) => {
    // For now, we'll just get all roles and filter them client-side
    // since the backend doesn't have a dedicated search endpoint
    const response = await api.get('/roles');
    
    // If there's no search or filter params, return all roles
    if (!params.search && (!params.permissions || params.permissions.length === 0)) {
      return response;
    }
    
    // Otherwise, filter the roles client-side
    if (Array.isArray(response.data)) {
      const filteredRoles = response.data.filter(role => {
        // Filter by search term
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          const nameMatch = role.name.toLowerCase().includes(searchLower);
          const descMatch = role.description && role.description.toLowerCase().includes(searchLower);
          
          if (!nameMatch && !descMatch) {
            return false;
          }
        }
        
        // Filter by permissions
        if (params.permissions && params.permissions.length > 0) {
          // Check if the role has any of the selected permissions
          const hasPermission = role.permissions && role.permissions.some((permission: Permission) => 
            params.permissions!.includes(permission.id)
          );
          
          if (!hasPermission) {
            return false;
          }
        }
        
        return true;
      });
      
      // Sort the filtered roles
      if (params.sortBy) {
        filteredRoles.sort((a, b) => {
          const aValue = a[params.sortBy as keyof typeof a];
          const bValue = b[params.sortBy as keyof typeof b];
          
          if (aValue === undefined || bValue === undefined) {
            return 0;
          }
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return params.sortDir === 'asc' 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          }
          
          return params.sortDir === 'asc' 
            ? (aValue > bValue ? 1 : -1) 
            : (aValue < bValue ? 1 : -1);
        });
      }
      
      // Paginate the results
      const page = params.page || 0;
      const size = params.size || 10;
      const start = page * size;
      const end = start + size;
      const paginatedRoles = filteredRoles.slice(start, end);
      
      // Create a paginated response
      return {
        data: {
          content: paginatedRoles,
          totalElements: filteredRoles.length,
          totalPages: Math.ceil(filteredRoles.length / size),
          size: size,
          number: page,
          first: page === 0,
          last: end >= filteredRoles.length,
          empty: paginatedRoles.length === 0
        }
      };
    }
    
    return response;
  };
}

export default new RoleService();
