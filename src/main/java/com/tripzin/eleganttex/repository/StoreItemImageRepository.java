package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.StoreItemImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreItemImageRepository extends JpaRepository<StoreItemImage, Long> {
    
    /**
     * Find images by store item ID
     */
    List<StoreItemImage> findByStoreItemId(Long storeItemId);
    
    /**
     * Delete images by store item ID
     */
    void deleteByStoreItemId(Long storeItemId);
}
