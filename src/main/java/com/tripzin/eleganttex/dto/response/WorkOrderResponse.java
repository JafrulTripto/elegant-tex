package com.tripzin.eleganttex.dto.response;

import com.tripzin.eleganttex.dto.UserDTO;
import com.tripzin.eleganttex.entity.WorkOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderResponse {
    
    private Long id;
    private String woNumber;
    private String workType;
    private String client;
    private Integer photoCount;
    private String state;
    private LocalDate clientDueDate;
    private String updater;
    private String orderStatus;
    private String remarkCategory;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer numberOfBids;
    private BigDecimal bidAmount;
    private boolean isRush;
    private UserDTO user;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static WorkOrderResponse fromEntity(WorkOrder workOrder) {
        return WorkOrderResponse.builder()
                .id(workOrder.getId())
                .woNumber(workOrder.getWoNumber())
                .workType(workOrder.getWorkType())
                .client(workOrder.getClient())
                .photoCount(workOrder.getPhotoCount())
                .state(workOrder.getState())
                .clientDueDate(workOrder.getClientDueDate())
                .updater(workOrder.getUpdater())
                .orderStatus(workOrder.getOrderStatus())
                .remarkCategory(workOrder.getRemarkCategory())
                .startTime(workOrder.getStartTime())
                .endTime(workOrder.getEndTime())
                .numberOfBids(workOrder.getNumberOfBids())
                .bidAmount(workOrder.getBidAmount())
                .isRush(workOrder.isRush())
                .user(workOrder.getUser() != null ? UserDTO.fromEntity(workOrder.getUser()) : null)
                .createdAt(workOrder.getCreatedAt())
                .updatedAt(workOrder.getUpdatedAt())
                .build();
    }
}
