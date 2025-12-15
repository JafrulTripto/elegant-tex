package com.tripzin.eleganttex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreAdjustmentResponse {
    
    private Long id;
    private StoreItemBasicResponse storeItem;
    private FabricBasicResponse fabric;
    private ProductTypeBasicResponse productType;
    private Integer requestedQuantity;
    private Integer currentQuantity;
    private String quality;
    private String adjustmentType;
    private String status;
    private String reason;
    private String notes;
    private UserBasicResponse requestedBy;
    private UserBasicResponse approvedBy;
    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreItemBasicResponse {
        private Long id;
        private String sku;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FabricBasicResponse {
        private Long id;
        private String name;
        private String fabricCode;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductTypeBasicResponse {
        private Long id;
        private String name;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserBasicResponse {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
    }
}
