package com.tripzin.eleganttex.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "Marketplace ID is required")
    private Long marketplaceId;
    
    @NotBlank(message = "Customer name is required")
    @Size(max = 255, message = "Customer name must be less than 255 characters")
    private String customerName;
    
    @NotBlank(message = "Customer phone is required")
    @Size(max = 20, message = "Customer phone must be less than 20 characters")
    private String customerPhone;
    
    @NotBlank(message = "Customer address is required")
    @Size(max = 500, message = "Customer address must be less than 500 characters")
    private String customerAddress;
    
    @Size(max = 20, message = "Customer alternative phone must be less than 20 characters")
    private String customerAlternativePhone;
    
    @Size(max = 255, message = "Customer Facebook ID must be less than 255 characters")
    private String customerFacebookId;
    
    @NotBlank(message = "Delivery channel is required")
    @Size(max = 50, message = "Delivery channel must be less than 50 characters")
    private String deliveryChannel;
    
    @NotNull(message = "Delivery charge is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Delivery charge must be greater than or equal to 0")
    private BigDecimal deliveryCharge;
    
    @NotNull(message = "Delivery date is required")
    private LocalDate deliveryDate;
    
    @NotNull(message = "At least one product is required")
    @Size(min = 1, message = "At least one product is required")
    @Valid
    @Builder.Default
    private List<OrderProductRequest> products = new ArrayList<>();
}
