package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Fabric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FabricRepository extends JpaRepository<Fabric, Long> {
    @NonNull
    Page<Fabric> findAll(@NonNull Pageable pageable);
    List<Fabric> findByTagsId(Long tagId);
    boolean existsByImageId(Long imageId);
    
    // Search fabrics by name (case-insensitive)
    Page<Fabric> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    // Search fabrics by name or tag name
    Page<Fabric> findDistinctByNameContainingIgnoreCaseOrTags_NameContainingIgnoreCase(
        String name, String tagName, Pageable pageable);
    
    // Find active fabrics
    Page<Fabric> findByActiveTrue(Pageable pageable);
    
    // Search active fabrics by name or tag name
    Page<Fabric> findDistinctByNameContainingIgnoreCaseOrTags_NameContainingIgnoreCaseAndActiveTrue(
        String name, String tagName, Pageable pageable);
}
