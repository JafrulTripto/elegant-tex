package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    /**
     * Find addresses by division ID
     */
    @Query("SELECT a FROM Address a WHERE a.division.id = :divisionId ORDER BY a.createdAt DESC")
    List<Address> findByDivisionIdOrderByCreatedAtDesc(@Param("divisionId") Long divisionId);

    /**
     * Find addresses by district ID
     */
    @Query("SELECT a FROM Address a WHERE a.district.id = :districtId ORDER BY a.createdAt DESC")
    List<Address> findByDistrictIdOrderByCreatedAtDesc(@Param("districtId") Long districtId);

    /**
     * Find addresses by upazila ID
     */
    @Query("SELECT a FROM Address a WHERE a.upazila.id = :upazilaId ORDER BY a.createdAt DESC")
    List<Address> findByUpazilaIdOrderByCreatedAtDesc(@Param("upazilaId") Long upazilaId);

    /**
     * Find address by exact geographical location and address line
     */
    @Query("SELECT a FROM Address a WHERE a.division.id = :divisionId AND a.district.id = :districtId AND a.upazila.id = :upazilaId AND a.addressLine = :addressLine")
    Optional<Address> findByGeographicalLocationAndAddressLine(
        @Param("divisionId") Long divisionId,
        @Param("districtId") Long districtId,
        @Param("upazilaId") Long upazilaId,
        @Param("addressLine") String addressLine
    );

    /**
     * Search addresses by address line containing text
     */
    @Query("SELECT a FROM Address a WHERE LOWER(a.addressLine) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY a.createdAt DESC")
    List<Address> searchByAddressLine(@Param("searchTerm") String searchTerm);

    /**
     * Count addresses by division
     */
    long countByDivisionId(Long divisionId);

    /**
     * Count addresses by district
     */
    long countByDistrictId(Long districtId);

    /**
     * Count addresses by upazila
     */
    long countByUpazilaId(Long upazilaId);
}
