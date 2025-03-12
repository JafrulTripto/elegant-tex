package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderProductRepository extends JpaRepository<OrderProduct, Long> {

    List<OrderProduct> findByOrderId(Long orderId);
    
    @Query("SELECT op FROM OrderProduct op LEFT JOIN FETCH op.fabric WHERE op.id = :id")
    Optional<OrderProduct> findByIdWithFabric(@Param("id") Long id);
    
    @Query("SELECT op FROM OrderProduct op LEFT JOIN FETCH op.images WHERE op.id = :id")
    Optional<OrderProduct> findByIdWithImages(@Param("id") Long id);
    
    @Query("SELECT op FROM OrderProduct op LEFT JOIN FETCH op.fabric LEFT JOIN FETCH op.images WHERE op.id = :id")
    Optional<OrderProduct> findByIdWithFabricAndImages(@Param("id") Long id);
    
    @Query("SELECT COUNT(op) > 0 FROM OrderProduct op WHERE op.fabric.id = :fabricId")
    boolean existsByFabricId(@Param("fabricId") Long fabricId);
    
    void deleteByOrderId(Long orderId);
}
