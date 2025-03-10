package com.tripzin.eleganttex.dto.response;

import com.tripzin.eleganttex.entity.Marketplace;
import com.tripzin.eleganttex.entity.User;
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
public class MarketplaceResponse {
    
    private Long id;
    private String name;
    private String pageUrl;
    private Long imageId;
    private Set<UserSummaryDTO> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static MarketplaceResponse fromEntity(Marketplace marketplace) {
        return MarketplaceResponse.builder()
                .id(marketplace.getId())
                .name(marketplace.getName())
                .pageUrl(marketplace.getPageUrl())
                .imageId(marketplace.getImageId())
                .members(marketplace.getMembers().stream()
                        .map(UserSummaryDTO::fromEntity)
                        .collect(Collectors.toSet()))
                .createdAt(marketplace.getCreatedAt())
                .updatedAt(marketplace.getUpdatedAt())
                .build();
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummaryDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private Long profileImageId;
        
        public static UserSummaryDTO fromEntity(User user) {
            return UserSummaryDTO.builder()
                    .id(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .profileImageId(user.getProfileImageId())
                    .build();
        }
    }
}
