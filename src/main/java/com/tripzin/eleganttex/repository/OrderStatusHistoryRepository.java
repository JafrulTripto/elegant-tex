package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {

    List<OrderStatusHistory> findByOrderIdOrderByTimestampDesc(Long orderId);
    
    @Query("SELECT osh FROM OrderStatusHistory osh LEFT JOIN FETCH osh.updatedBy WHERE osh.order.id = :orderId ORDER BY osh.timestamp DESC")
    List<OrderStatusHistory> findByOrderIdWithUserOrderByTimestampDesc(@Param("orderId") Long orderId);
    
    void deleteByOrderId(Long orderId);
}
