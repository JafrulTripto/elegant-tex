package com.tripzin.eleganttex.dto.response;

import com.tripzin.eleganttex.entity.Fabric;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FabricResponse {
    
    private Long id;
    private String name;
    private Long imageId;
    private boolean active;
    private Set<TagDTO> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static FabricResponse fromEntity(Fabric fabric) {
        return FabricResponse.builder()
                .id(fabric.getId())
                .name(fabric.getName())
                .imageId(fabric.getImageId())
                .active(fabric.getActive())
                .tags(fabric.getTags().stream()
                        .map(TagDTO::fromEntity)
                        .collect(Collectors.toSet()))
                .createdAt(fabric.getCreatedAt())
                .updatedAt(fabric.getUpdatedAt())
                .build();
    }
}
