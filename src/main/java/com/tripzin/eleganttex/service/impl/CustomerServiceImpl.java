package com.tripzin.eleganttex.service.impl;

import com.tripzin.eleganttex.dto.request.CustomerRequest;
import com.tripzin.eleganttex.dto.response.CustomerResponse;
import com.tripzin.eleganttex.entity.Customer;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.CustomerRepository;
import com.tripzin.eleganttex.service.CustomerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerRequest customerRequest) {
        log.info("Creating new customer with phone: {}", customerRequest.getPhone());
        
        // Check if customer with this phone already exists
        Optional<Customer> existingCustomer = customerRepository.findByPhone(customerRequest.getPhone());
        if (existingCustomer.isPresent()) {
            log.info("Customer with phone {} already exists, returning existing customer", customerRequest.getPhone());
            return mapCustomerToResponse(existingCustomer.get());
        }
        
        // Create new customer
        Customer customer = Customer.builder()
                .name(customerRequest.getName())
                .phone(customerRequest.getPhone())
                .address(customerRequest.getAddress())
                .alternativePhone(customerRequest.getAlternativePhone())
                .facebookId(customerRequest.getFacebookId())
                .build();
        
        Customer savedCustomer = customerRepository.save(customer);
        log.info("Created new customer with ID: {}", savedCustomer.getId());
        
        return mapCustomerToResponse(savedCustomer);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest customerRequest) {
        log.info("Updating customer with ID: {}", id);
        
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        
        // Check if phone is being changed and if new phone is already in use
        if (!customer.getPhone().equals(customerRequest.getPhone())) {
            Optional<Customer> existingCustomer = customerRepository.findByPhone(customerRequest.getPhone());
            if (existingCustomer.isPresent() && !existingCustomer.get().getId().equals(id)) {
                throw new IllegalArgumentException("Phone number already in use by another customer");
            }
        }
        
        // Update customer fields
        customer.setName(customerRequest.getName());
        customer.setPhone(customerRequest.getPhone());
        customer.setAddress(customerRequest.getAddress());
        customer.setAlternativePhone(customerRequest.getAlternativePhone());
        customer.setFacebookId(customerRequest.getFacebookId());
        
        Customer updatedCustomer = customerRepository.save(customer);
        log.info("Updated customer with ID: {}", updatedCustomer.getId());
        
        return mapCustomerToResponse(updatedCustomer);
    }

    @Override
    public CustomerResponse getCustomerById(Long id) {
        log.info("Getting customer by ID: {}", id);
        
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        
        return mapCustomerToResponse(customer);
    }

    @Override
    public Customer getCustomerEntityById(Long id) {
        log.info("Getting customer entity by ID: {}", id);
        
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
    }

    @Override
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        log.info("Getting all customers with pagination");
        
        return customerRepository.findAll(pageable)
                .map(this::mapCustomerToResponse);
    }

    @Override
    public Page<CustomerResponse> searchCustomers(String searchTerm, Pageable pageable) {
        log.info("Searching customers with term: {}", searchTerm);
        
        return customerRepository.searchByNameOrPhone(searchTerm, pageable)
                .map(this::mapCustomerToResponse);
    }

    @Override
    public Optional<CustomerResponse> findCustomerByPhone(String phone) {
        log.info("Finding customer by phone: {}", phone);
        
        return customerRepository.findByPhone(phone)
                .map(this::mapCustomerToResponse);
    }

    @Override
    @Transactional
    public CustomerResponse findOrCreateCustomer(CustomerRequest customerRequest) {
        log.info("Finding or creating customer with phone: {}", customerRequest.getPhone());
        
        // Try to find existing customer by phone
        Optional<Customer> existingCustomer = customerRepository.findByPhone(customerRequest.getPhone());
        
        if (existingCustomer.isPresent()) {
            log.info("Found existing customer with ID: {}", existingCustomer.get().getId());
            return mapCustomerToResponse(existingCustomer.get());
        } else {
            log.info("No existing customer found, creating new customer");
            return createCustomer(customerRequest);
        }
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        log.info("Deleting customer with ID: {}", id);
        
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + id);
        }
        
        customerRepository.deleteById(id);
    }
    
    /**
     * Map a Customer entity to a CustomerResponse DTO
     */
    private CustomerResponse mapCustomerToResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .alternativePhone(customer.getAlternativePhone())
                .facebookId(customer.getFacebookId())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}
