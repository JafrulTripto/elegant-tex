package com.tripzin.eleganttex.dto.request;

import lombok.Data;

@Data
public class UpdateQualityRequest {
    private String quality; // NEW, GOOD, FAIR, DAMAGED, WRITE_OFF
    private String notes;
}
