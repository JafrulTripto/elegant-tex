package com.tripzin.eleganttex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreStatisticsResponse {
    
    private Long totalItems;
    private Integer totalQuantity;
    private Double totalValue;
    private Long itemsWithStock;
    private Map<String, Long> countByQuality;
    private Map<String, Long> countBySource;
    private Long pendingApprovals;
    private Long recentTransactions;
}
