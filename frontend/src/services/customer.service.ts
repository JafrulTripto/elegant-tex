import api from './api';
import { Customer, CustomerRequest, CustomerType } from '../types/customer';

const BASE_URL = '/customers';

/**
 * Get all customers with pagination and optional customer type filter
 * @param page Page number (0-based)
 * @param size Page size
 * @param customerType Optional customer type filter
 * @returns Paginated list of customers
 */
export const getCustomers = async (page = 0, size = 10, customerType?: CustomerType): Promise<{ content: Customer[], totalElements: number }> => {
  try {
    const params: any = { page, size };
    if (customerType) {
      params.customerType = customerType;
    }
    
    const response = await api.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Get a customer by ID
 * @param id Customer ID
 * @returns Customer details
 */
export const getCustomerById = async (id: number): Promise<Customer> => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Search customers by name or phone with optional customer type filter
 * @param term Search term
 * @param page Page number (0-based)
 * @param size Page size
 * @param customerType Optional customer type filter
 * @returns Paginated list of customers matching the search term
 */
export const searchCustomers = async (term: string, page = 0, size = 10, customerType?: CustomerType): Promise<{ content: Customer[], totalElements: number }> => {
  try {
    const params: any = { term, page, size };
    if (customerType) {
      params.customerType = customerType;
    }
    
    const response = await api.get(`${BASE_URL}/search`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

/**
 * Find a customer by phone number
 * @param phone Phone number
 * @returns Customer details if found, null otherwise
 */
export const findCustomerByPhone = async (phone: string): Promise<Customer | null> => {
  try {
    const response = await api.get(`${BASE_URL}/phone/${phone}`);
    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      return null; // Customer not found
    }
    console.error(`Error finding customer with phone ${phone}:`, error);
    throw error;
  }
};

/**
 * Create a new customer
 * @param customerData Customer data
 * @returns Created customer
 */
export const createCustomer = async (customerData: CustomerRequest): Promise<Customer> => {
  try {
    const response = await api.post(BASE_URL, customerData);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Update an existing customer
 * @param id Customer ID
 * @param customerData Updated customer data
 * @returns Updated customer
 */
export const updateCustomer = async (id: number, customerData: CustomerRequest): Promise<Customer> => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error(`Error updating customer with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Find an existing customer by phone or create a new one
 * @param customerData Customer data
 * @returns Existing or newly created customer
 */
export const findOrCreateCustomer = async (customerData: CustomerRequest): Promise<Customer> => {
  try {
    const response = await api.post(`${BASE_URL}/find-or-create`, customerData);
    return response.data;
  } catch (error) {
    console.error('Error finding or creating customer:', error);
    throw error;
  }
};

/**
 * Delete a customer
 * @param id Customer ID
 */
export const deleteCustomer = async (id: number) => {
  try {
    await api.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting customer with ID ${id}:`, error);
    throw error;
  }
};

const customerService = {
  getCustomers,
  getCustomerById,
  searchCustomers,
  findCustomerByPhone,
  createCustomer,
  updateCustomer,
  findOrCreateCustomer,
  deleteCustomer
};

export default customerService;
