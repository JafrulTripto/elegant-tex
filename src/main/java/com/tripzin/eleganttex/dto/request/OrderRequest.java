package com.tripzin.eleganttex.dto.request;

import com.tripzin.eleganttex.entity.BusinessUnit;
import com.tripzin.eleganttex.entity.OrderType;
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

    @NotNull(message = "Order type is required")
    private OrderType orderType;
    
    @NotNull(message = "Business unit is required")
    private BusinessUnit businessUnit;
    
    // Marketplace ID is only required for marketplace orders
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
    
    // Custom validation to ensure marketplaceId is provided for marketplace orders
    @AssertTrue(message = "Marketplace ID is required for marketplace orders but optional for merchant orders")
    private boolean isMarketplaceValid() {
        // If it's a merchant order, no marketplace is needed
        if (orderType == OrderType.MERCHANT) {
            return true;
        }
        // If it's a marketplace order, marketplace ID is required
        return marketplaceId != null;
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
