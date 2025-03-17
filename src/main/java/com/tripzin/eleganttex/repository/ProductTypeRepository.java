package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {
    
    Optional<ProductType> findByName(String name);
    
    List<ProductType> findByActive(Boolean active);
    
    boolean existsByName(String name);
}
