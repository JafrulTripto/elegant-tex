package com.tripzin.eleganttex.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class FabricRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private Long imageId;
    
    @Builder.Default
    private boolean active = true;
    
    @Builder.Default
    private Set<String> tagNames = new HashSet<>();
}
