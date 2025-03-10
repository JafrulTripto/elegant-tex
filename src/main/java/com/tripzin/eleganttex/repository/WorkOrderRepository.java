package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.WorkOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long>, JpaSpecificationExecutor<WorkOrder> {
    
    long countByOrderStatus(String orderStatus);
    
    long countByOrderStatusAndIsRush(String orderStatus, boolean isRush);
    
    @NonNull
    Page<WorkOrder> findAll(@Nullable Specification<WorkOrder> spec, @NonNull Pageable pageable);
}
