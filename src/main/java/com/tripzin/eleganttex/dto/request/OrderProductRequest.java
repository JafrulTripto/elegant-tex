package com.tripzin.eleganttex.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderProductRequest {

    private Long id;
    
    @NotNull(message = "Product type ID is required")
    private Long productTypeId;
    
    @NotNull(message = "Fabric ID is required")
    private Long fabricId;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0", inclusive = true, message = "Price must be greater than or equal to 0")
    private BigDecimal price;
    
    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    @NotNull(message = "Style code is required")
    @Size(min = 1, max = 64, message = "Style code must be between 1 and 64 characters")
    private String styleCode;
    
    @Builder.Default
    private List<Long> imageIds = new ArrayList<>();
    
    @Builder.Default
    private List<String> tempImageBase64 = new ArrayList<>();
}
