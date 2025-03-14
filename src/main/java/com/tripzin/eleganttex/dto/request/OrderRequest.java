package com.tripzin.eleganttex.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
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
    
    // Either customerId or customerData must be provided
    private Long customerId;
    
    // Customer data for creating a new customer if needed
    private CustomerRequest customerData;
    
    // Custom validation to ensure either customerId or customerData is provided
    @AssertTrue(message = "Either customerId or customerData must be provided")
    private boolean isCustomerInfoValid() {
        return customerId != null || customerData != null;
    }
    
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
