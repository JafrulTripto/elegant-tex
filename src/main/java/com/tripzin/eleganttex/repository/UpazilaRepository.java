package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Upazila;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UpazilaRepository extends JpaRepository<Upazila, Long> {

    /**
     * Find upazila by name
     */
    Optional<Upazila> findByName(String name);

    /**
     * Find upazila by URL
     */
    Optional<Upazila> findByUrl(String url);

    /**
     * Find all upazilas by district ID ordered by name
     */
    @Query("SELECT u FROM Upazila u WHERE u.district.id = :districtId ORDER BY u.name ASC")
    List<Upazila> findByDistrictIdOrderByName(@Param("districtId") Long districtId);

    /**
     * Find all upazilas ordered by name
     */
    @Query("SELECT u FROM Upazila u ORDER BY u.name ASC")
    List<Upazila> findAllOrderByName();

    /**
     * Check if upazila exists by name and district
     */
    boolean existsByNameAndDistrictId(String name, Long districtId);

    /**
     * Check if upazila exists by URL
     */
    boolean existsByUrl(String url);

    /**
     * Count upazilas by district
     */
    long countByDistrictId(Long districtId);

    /**
     * Find upazilas by division ID through district relationship
     */
    @Query("SELECT u FROM Upazila u WHERE u.district.division.id = :divisionId ORDER BY u.name ASC")
    List<Upazila> findByDivisionIdOrderByName(@Param("divisionId") Long divisionId);
}
