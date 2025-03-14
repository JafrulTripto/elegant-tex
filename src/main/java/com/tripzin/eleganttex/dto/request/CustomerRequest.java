package com.tripzin.eleganttex.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {
    
    @NotBlank(message = "Customer name is required")
    @Size(max = 255, message = "Customer name must be less than 255 characters")
    private String name;
    
    @NotBlank(message = "Customer phone is required")
    @Size(max = 20, message = "Customer phone must be less than 20 characters")
    private String phone;
    
    @NotBlank(message = "Customer address is required")
    @Size(max = 500, message = "Customer address must be less than 500 characters")
    private String address;
    
    @Size(max = 20, message = "Customer alternative phone must be less than 20 characters")
    private String alternativePhone;
    
    @Size(max = 255, message = "Customer Facebook ID must be less than 255 characters")
    private String facebookId;
}
