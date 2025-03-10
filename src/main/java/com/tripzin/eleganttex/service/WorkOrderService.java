package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.request.WorkOrderRequest;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.dto.response.WorkOrderResponse;
import com.tripzin.eleganttex.dto.response.WorkOrderStats;
import com.tripzin.eleganttex.entity.User;
import com.tripzin.eleganttex.entity.WorkOrder;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.UserRepository;
import com.tripzin.eleganttex.repository.WorkOrderRepository;
import com.tripzin.eleganttex.repository.spec.WorkOrderSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkOrderService {
    
    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;
    
    public Page<WorkOrderResponse> getAllWorkOrders(
            int page, 
            int size, 
            String sortBy, 
            String sortDir,
            Map<String, String> filters) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return workOrderRepository.findAll(
                WorkOrderSpecification.filterBy(filters), 
                pageable
            ).map(WorkOrderResponse::fromEntity);
    }
    
    public WorkOrderResponse getWorkOrderById(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with id: " + id));
        return WorkOrderResponse.fromEntity(workOrder);
    }
    
    @Transactional
    public WorkOrderResponse createWorkOrder(WorkOrderRequest request) {
        WorkOrder workOrder = mapRequestToEntity(request, new WorkOrder());
        WorkOrder savedWorkOrder = workOrderRepository.save(workOrder);
        return WorkOrderResponse.fromEntity(savedWorkOrder);
    }
    
    @Transactional
    public WorkOrderResponse updateWorkOrder(Long id, WorkOrderRequest request) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with id: " + id));
        
        WorkOrder updatedWorkOrder = mapRequestToEntity(request, workOrder);
        WorkOrder savedWorkOrder = workOrderRepository.save(updatedWorkOrder);
        return WorkOrderResponse.fromEntity(savedWorkOrder);
    }
    
    @Transactional
    public MessageResponse deleteWorkOrder(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with id: " + id));
        
        workOrderRepository.delete(workOrder);
        return MessageResponse.success("Work order deleted successfully");
    }
    
    public WorkOrderStats getWorkOrderStats() {
        long submitted = workOrderRepository.countByOrderStatus("Submitted");
        long gcSnSubmitted = workOrderRepository.countByOrderStatusAndIsRush("Submitted", true);
        long rtvFixed = workOrderRepository.countByOrderStatus("RTV Fixed");
        long saved = workOrderRepository.countByOrderStatus("Saved");
        long totalProcessed = workOrderRepository.count();
        
        return WorkOrderStats.builder()
                .submitted(submitted)
                .gcSnSubmitted(gcSnSubmitted)
                .rtvFixed(rtvFixed)
                .saved(saved)
                .totalProcessed(totalProcessed)
                .build();
    }
    
    private WorkOrder mapRequestToEntity(WorkOrderRequest request, WorkOrder workOrder) {
        workOrder.setWoNumber(request.getWoNumber());
        workOrder.setWorkType(request.getWorkType());
        workOrder.setClient(request.getClient());
        workOrder.setPhotoCount(request.getPhotoCount());
        workOrder.setState(request.getState());
        workOrder.setClientDueDate(request.getClientDueDate());
        workOrder.setUpdater(request.getUpdater());
        workOrder.setOrderStatus(request.getOrderStatus());
        workOrder.setRemarkCategory(request.getRemarkCategory());
        workOrder.setStartTime(request.getStartTime());
        workOrder.setEndTime(request.getEndTime());
        workOrder.setNumberOfBids(request.getNumberOfBids());
        workOrder.setBidAmount(request.getBidAmount());
        workOrder.setRush(request.isRush());
        
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
            workOrder.setUser(user);
        }
        
        return workOrder;
    }
}
