package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.OrderProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderProductImageRepository extends JpaRepository<OrderProductImage, Long> {

    List<OrderProductImage> findByOrderProductId(Long orderProductId);
    
    void deleteByOrderProductId(Long orderProductId);
    
    void deleteByImageId(Long imageId);
}
