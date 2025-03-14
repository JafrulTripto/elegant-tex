package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.request.CustomerRequest;
import com.tripzin.eleganttex.dto.response.CustomerResponse;
import com.tripzin.eleganttex.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface CustomerService {

    /**
     * Create a new customer
     * @param customerRequest The customer data
     * @return The created customer
     */
    CustomerResponse createCustomer(CustomerRequest customerRequest);
    
    /**
     * Update an existing customer
     * @param id The customer ID
     * @param customerRequest The updated customer data
     * @return The updated customer
     */
    CustomerResponse updateCustomer(Long id, CustomerRequest customerRequest);
    
    /**
     * Get a customer by ID
     * @param id The customer ID
     * @return The customer
     */
    CustomerResponse getCustomerById(Long id);
    
    /**
     * Get all customers with pagination
     * @param pageable Pagination information
     * @return Page of customers
     */
    Page<CustomerResponse> getAllCustomers(Pageable pageable);
    
    /**
     * Search customers by name or phone
     * @param searchTerm The term to search for
     * @param pageable Pagination information
     * @return Page of customers
     */
    Page<CustomerResponse> searchCustomers(String searchTerm, Pageable pageable);
    
    /**
     * Find a customer by phone number
     * @param phone The phone number
     * @return Optional containing the customer if found
     */
    Optional<CustomerResponse> findCustomerByPhone(String phone);
    
    /**
     * Find or create a customer by phone number
     * @param customerRequest The customer data
     * @return The existing or newly created customer
     */
    CustomerResponse findOrCreateCustomer(CustomerRequest customerRequest);
    
    /**
     * Delete a customer
     * @param id The customer ID
     */
    void deleteCustomer(Long id);
    
    /**
     * Get a customer entity by ID
     * @param id The customer ID
     * @return The customer entity
     */
    Customer getCustomerEntityById(Long id);
}
