package com.tripzin.eleganttex.dto.request;

import lombok.Data;

@Data
public class AdjustQuantityRequest {
    private Integer quantityChange; // positive to add, negative to subtract
    private String notes;
}
