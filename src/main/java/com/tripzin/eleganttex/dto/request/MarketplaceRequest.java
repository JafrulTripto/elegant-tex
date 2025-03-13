package com.tripzin.eleganttex.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceRequest {
    
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;
    
    @NotBlank(message = "Page URL is required")
    @Size(max = 255, message = "Page URL must be less than 255 characters")
    private String pageUrl;
    
    private Long imageId;
    
    @Builder.Default
    private boolean active = true;
    
    @Builder.Default
    private Set<Long> memberIds = new HashSet<>();
}
