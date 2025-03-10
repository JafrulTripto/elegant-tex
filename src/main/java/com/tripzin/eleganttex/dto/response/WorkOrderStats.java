package com.tripzin.eleganttex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderStats {
    
    private long submitted;
    private long gcSnSubmitted;
    private long rtvFixed;
    private long saved;
    private long totalProcessed;
}
