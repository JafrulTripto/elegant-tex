package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.StyleCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StyleCodeRepository extends JpaRepository<StyleCode, Long> {
    
    Optional<StyleCode> findByCode(String code);
    
    List<StyleCode> findByActive(Boolean active);
    
    boolean existsByCode(String code);
}
