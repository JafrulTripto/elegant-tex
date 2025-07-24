package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {

    /**
     * Find district by name
     */
    Optional<District> findByName(String name);

    /**
     * Find district by URL
     */
    Optional<District> findByUrl(String url);

    /**
     * Find all districts by division ID ordered by name
     */
    @Query("SELECT d FROM District d WHERE d.division.id = :divisionId ORDER BY d.name ASC")
    List<District> findByDivisionIdOrderByName(@Param("divisionId") Long divisionId);

    /**
     * Find all districts ordered by name
     */
    @Query("SELECT d FROM District d ORDER BY d.name ASC")
    List<District> findAllOrderByName();

    /**
     * Check if district exists by name and division
     */
    boolean existsByNameAndDivisionId(String name, Long divisionId);

    /**
     * Check if district exists by URL
     */
    boolean existsByUrl(String url);

    /**
     * Count districts by division
     */
    long countByDivisionId(Long divisionId);
}
