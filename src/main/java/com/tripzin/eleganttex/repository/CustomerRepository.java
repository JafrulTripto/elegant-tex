package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Customer;
import com.tripzin.eleganttex.entity.CustomerType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Find a customer by phone number
     * @param phone The phone number to search for
     * @return Optional containing the customer if found
     */
    Optional<Customer> findByPhone(String phone);
    
    /**
     * Find customers by name containing the given string (case insensitive)
     * @param name The name to search for
     * @param pageable Pagination information
     * @return Page of customers
     */
    @Query("SELECT c FROM Customer c WHERE LOWER(CAST(c.name as string)) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%'))")
    Page<Customer> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
    
    /**
     * Search customers by name or phone
     * @param searchTerm The term to search for in name or phone
     * @param pageable Pagination information
     * @return Page of customers
     */
    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(CAST(c.name as string)) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')) OR " +
           "LOWER(CAST(c.phone as string)) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%'))")
    Page<Customer> searchByNameOrPhone(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Find customers by customer type
     * @param customerType The customer type to filter by
     * @param pageable Pagination information
     * @return Page of customers
     */
    Page<Customer> findByCustomerType(CustomerType customerType, Pageable pageable);
    
    /**
     * Search customers by name or phone and filter by customer type
     * @param searchTerm The term to search for in name or phone
     * @param customerType The customer type to filter by
     * @param pageable Pagination information
     * @return Page of customers
     */
    @Query("SELECT c FROM Customer c WHERE " +
           "(LOWER(CAST(c.name as string)) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')) OR " +
           "LOWER(CAST(c.phone as string)) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%'))) " +
           "AND c.customerType = :customerType")
    Page<Customer> searchByNameOrPhoneAndCustomerType(@Param("searchTerm") String searchTerm, 
                                                     @Param("customerType") CustomerType customerType, 
                                                     Pageable pageable);
    
    /**
     * Find customers by name containing the given string and customer type
     * @param name The name to search for
     * @param customerType The customer type to filter by
     * @param pageable Pagination information
     * @return Page of customers
     */
    @Query("SELECT c FROM Customer c WHERE LOWER(CAST(c.name as string)) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')) " +
           "AND c.customerType = :customerType")
    Page<Customer> findByNameContainingIgnoreCaseAndCustomerType(@Param("name") String name, 
                                                                @Param("customerType") CustomerType customerType, 
                                                                Pageable pageable);
}
