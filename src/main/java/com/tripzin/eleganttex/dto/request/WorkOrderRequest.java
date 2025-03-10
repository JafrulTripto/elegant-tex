package com.tripzin.eleganttex.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class WorkOrderRequest {
    
    @NotBlank
    private String woNumber;
    
    @NotBlank
    private String workType;
    
    @NotBlank
    private String client;
    
    private Integer photoCount;
    
    private String state;
    
    @NotNull
    private LocalDate clientDueDate;
    
    private String updater;
    
    @NotBlank
    private String orderStatus;
    
    private String remarkCategory;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    private Integer numberOfBids;
    
    private BigDecimal bidAmount;
    
    private boolean isRush;
    
    private Long userId;
}
