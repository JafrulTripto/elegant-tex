package com.tripzin.eleganttex.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualStoreItemRequest {
    
    @NotNull(message = "Fabric ID is required")
    private Long fabricId;
    
    @NotNull(message = "Product type ID is required")
    private Long productTypeId;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    @NotBlank(message = "Quality is required")
    private String quality; // StoreItemQuality enum value
    
    private BigDecimal originalPrice;
    
    private String reason;
    
    private String notes;
    
    private List<Long> imageIds; // Optional image references
}
