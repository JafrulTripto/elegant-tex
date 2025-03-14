package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.request.CustomerRequest;
import com.tripzin.eleganttex.dto.response.CustomerResponse;
import com.tripzin.eleganttex.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

@PostMapping
@PreAuthorize("hasAuthority('ORDER_CREATE')")
public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest customerRequest) {
    CustomerResponse customer = customerService.createCustomer(customerRequest);
    return ResponseEntity.ok(customer);
}

@PutMapping("/{id}")
@PreAuthorize("hasAuthority('ORDER_UPDATE')")
public ResponseEntity<CustomerResponse> updateCustomer(
        @PathVariable Long id,
        @Valid @RequestBody CustomerRequest customerRequest) {
    CustomerResponse customer = customerService.updateCustomer(id, customerRequest);
    return ResponseEntity.ok(customer);
}

@GetMapping("/{id}")
@PreAuthorize("hasAuthority('ORDER_READ')")
public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
    CustomerResponse customer = customerService.getCustomerById(id);
    return ResponseEntity.ok(customer);
}

@GetMapping
@PreAuthorize("hasAuthority('ORDER_READ')")
public ResponseEntity<Page<CustomerResponse>> getAllCustomers(
        @PageableDefault(size = 10) Pageable pageable) {
    Page<CustomerResponse> customers = customerService.getAllCustomers(pageable);
    return ResponseEntity.ok(customers);
}

@GetMapping("/search")
@PreAuthorize("hasAuthority('ORDER_READ')")
public ResponseEntity<Page<CustomerResponse>> searchCustomers(
        @RequestParam String term,
        @PageableDefault(size = 10) Pageable pageable) {
    Page<CustomerResponse> customers = customerService.searchCustomers(term, pageable);
    return ResponseEntity.ok(customers);
}

@GetMapping("/phone/{phone}")
@PreAuthorize("hasAuthority('ORDER_READ')")
public ResponseEntity<CustomerResponse> findCustomerByPhone(@PathVariable String phone) {
    Optional<CustomerResponse> customer = customerService.findCustomerByPhone(phone);
    return customer.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@PostMapping("/find-or-create")
@PreAuthorize("hasAuthority('ORDER_CREATE')")
public ResponseEntity<CustomerResponse> findOrCreateCustomer(@Valid @RequestBody CustomerRequest customerRequest) {
    CustomerResponse customer = customerService.findOrCreateCustomer(customerRequest);
    return ResponseEntity.ok(customer);
}

@DeleteMapping("/{id}")
@PreAuthorize("hasAuthority('ORDER_DELETE')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
