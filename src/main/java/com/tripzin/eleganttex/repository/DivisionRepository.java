package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DivisionRepository extends JpaRepository<Division, Long> {

    /**
     * Find division by name
     */
    Optional<Division> findByName(String name);

    /**
     * Find division by URL
     */
    Optional<Division> findByUrl(String url);

    /**
     * Find all divisions ordered by name
     */
    @Query("SELECT d FROM Division d ORDER BY d.name ASC")
    List<Division> findAllOrderByName();

    /**
     * Check if division exists by name
     */
    boolean existsByName(String name);

    /**
     * Check if division exists by URL
     */
    boolean existsByUrl(String url);
}
