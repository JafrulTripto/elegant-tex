package com.tripzin.eleganttex.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
    
    @NotBlank(message = "Product type is required")
    @Size(max = 100, message = "Product type must be less than 100 characters")
    private String productType;
    
    @NotNull(message = "Fabric ID is required")
    private Long fabricId;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0", inclusive = false, message = "Price must be grater or equal to 0")
    private BigDecimal price;
    
    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;
    
    @Builder.Default
    private List<Long> imageIds = new ArrayList<>();
    
    @Builder.Default
    private List<String> tempImageBase64 = new ArrayList<>();
}
