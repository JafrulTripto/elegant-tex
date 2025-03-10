package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Marketplace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplaceRepository extends JpaRepository<Marketplace, Long> {
    
    @Query("SELECT m FROM Marketplace m JOIN m.members u WHERE u.id = :userId")
    List<Marketplace> findByMembersId(@Param("userId") Long userId);
    
    @Query("SELECT m FROM Marketplace m JOIN m.members u WHERE u.id = :userId")
    Page<Marketplace> findByMembersId(@Param("userId") Long userId, Pageable pageable);
    
    Optional<Marketplace> findByName(String name);
    
    boolean existsByName(String name);
    
    boolean existsByPageUrl(String pageUrl);
    
    boolean existsByImageId(Long imageId);
    
    List<Marketplace> findByImageId(Long imageId);
}
