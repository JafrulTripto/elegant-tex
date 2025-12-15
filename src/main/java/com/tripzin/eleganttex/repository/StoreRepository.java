package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    
    /**
     * Find the main/default active store
     */
    @Query("SELECT s FROM Store s WHERE s.active = true ORDER BY s.id LIMIT 1")
    Optional<Store> findMainStore();
    
    /**
     * Find store by name
     */
    Optional<Store> findByName(String name);
    
    /**
     * Check if store exists by name
     */
    boolean existsByName(String name);
}
