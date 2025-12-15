package com.tripzin.eleganttex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreItemResponse {
    
    private Long id;
    private String sku;
    private FabricBasicResponse fabric;
    private ProductTypeBasicResponse productType;
    private String styleCode;
    private Integer quantity;
    private String quality;
    private String sourceType;
    private Long sourceOrderProductId;
    private String sourceOrderNumber;
    private BigDecimal originalPrice;
    private String notes;
    private UserBasicResponse addedBy;
    private List<StoreItemImageResponse> images;
    private List<StoreTransactionResponse> recentTransactions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
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
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreItemImageResponse {
        private Long id;
        private Long imageId;
        private String imageUrl;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreTransactionResponse {
        private Long id;
        private String transactionType;
        private Integer quantity;
        private String qualityBefore;
        private String qualityAfter;
        private String notes;
        private UserBasicResponse performedBy;
        private LocalDateTime transactionDate;
    }
}
