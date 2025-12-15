package com.tripzin.eleganttex.service.mapper;

import com.tripzin.eleganttex.dto.response.StoreAdjustmentResponse;
import com.tripzin.eleganttex.dto.response.StoreItemResponse;
import com.tripzin.eleganttex.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class StoreMapper {
    
    public StoreItemResponse toResponse(StoreItem storeItem) {
        if (storeItem == null) {
            return null;
        }
        
        return StoreItemResponse.builder()
                .id(storeItem.getId())
                .sku(storeItem.getSku())
                .fabric(toFabricBasic(storeItem.getFabric()))
                .productType(toProductTypeBasic(storeItem.getProductType()))
                .styleCode(storeItem.getStyleCode())
                .quantity(storeItem.getQuantity())
                .quality(storeItem.getQuality() != null ? storeItem.getQuality().name() : null)
                .sourceType(storeItem.getSourceType() != null ? storeItem.getSourceType().name() : null)
                .sourceOrderProductId(storeItem.getSourceOrderProductId())
                .sourceOrderNumber(storeItem.getSourceOrderNumber())
                .originalPrice(storeItem.getOriginalPrice())
                .notes(storeItem.getNotes())
                .addedBy(toUserBasic(storeItem.getAddedBy()))
                .images(toImageResponses(storeItem.getImages()))
                .recentTransactions(toTransactionResponses(storeItem.getTransactions()))
                .createdAt(storeItem.getCreatedAt())
                .updatedAt(storeItem.getUpdatedAt())
                .build();
    }
    
    public StoreAdjustmentResponse toAdjustmentResponse(StoreAdjustment adjustment) {
        if (adjustment == null) {
            return null;
        }
        
        return StoreAdjustmentResponse.builder()
                .id(adjustment.getId())
                .storeItem(adjustment.getStoreItem() != null ? 
                    StoreAdjustmentResponse.StoreItemBasicResponse.builder()
                        .id(adjustment.getStoreItem().getId())
                        .sku(adjustment.getStoreItem().getSku())
                        .build() : null)
                .fabric(toAdjustmentFabricBasic(adjustment.getFabric()))
                .productType(toAdjustmentProductTypeBasic(adjustment.getProductType()))
                .requestedQuantity(adjustment.getRequestedQuantity())
                .currentQuantity(adjustment.getCurrentQuantity())
                .quality(adjustment.getQuality() != null ? adjustment.getQuality().name() : null)
                .adjustmentType(adjustment.getAdjustmentType() != null ? adjustment.getAdjustmentType().name() : null)
                .status(adjustment.getStatus() != null ? adjustment.getStatus().name() : null)
                .reason(adjustment.getReason())
                .notes(adjustment.getNotes())
                .requestedBy(toAdjustmentUserBasic(adjustment.getRequestedBy()))
                .approvedBy(adjustment.getApprovedBy() != null ? toAdjustmentUserBasic(adjustment.getApprovedBy()) : null)
                .requestedAt(adjustment.getRequestedAt())
                .reviewedAt(adjustment.getReviewedAt())
                .build();
    }
    
    private StoreItemResponse.FabricBasicResponse toFabricBasic(Fabric fabric) {
        if (fabric == null) {
            return null;
        }
        
        return StoreItemResponse.FabricBasicResponse.builder()
                .id(fabric.getId())
                .name(fabric.getName())
                .fabricCode(fabric.getFabricCode())
                .build();
    }
    
    private StoreItemResponse.ProductTypeBasicResponse toProductTypeBasic(ProductType productType) {
        if (productType == null) {
            return null;
        }
        
        return StoreItemResponse.ProductTypeBasicResponse.builder()
                .id(productType.getId())
                .name(productType.getName())
                .build();
    }
    
    private StoreItemResponse.UserBasicResponse toUserBasic(User user) {
        if (user == null) {
            return null;
        }
        
        return StoreItemResponse.UserBasicResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .build();
    }
    
    private List<StoreItemResponse.StoreItemImageResponse> toImageResponses(List<StoreItemImage> images) {
        if (images == null || images.isEmpty()) {
            return Collections.emptyList();
        }
        
        return images.stream()
                .map(img -> StoreItemResponse.StoreItemImageResponse.builder()
                        .id(img.getId())
                        .imageId(img.getImageId())
                        .imageUrl(img.getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }
    
    private List<StoreItemResponse.StoreTransactionResponse> toTransactionResponses(List<StoreTransaction> transactions) {
        if (transactions == null || transactions.isEmpty()) {
            return Collections.emptyList();
        }
        
        return transactions.stream()
                .limit(5) // Only return recent 5 transactions
                .map(tx -> StoreItemResponse.StoreTransactionResponse.builder()
                        .id(tx.getId())
                        .transactionType(tx.getTransactionType() != null ? tx.getTransactionType().name() : null)
                        .quantity(tx.getQuantity())
                        .qualityBefore(tx.getQualityBefore() != null ? tx.getQualityBefore().name() : null)
                        .qualityAfter(tx.getQualityAfter() != null ? tx.getQualityAfter().name() : null)
                        .notes(tx.getNotes())
                        .performedBy(toUserBasic(tx.getPerformedBy()))
                        .transactionDate(tx.getTransactionDate())
                        .build())
                .collect(Collectors.toList());
    }
    
    private StoreAdjustmentResponse.FabricBasicResponse toAdjustmentFabricBasic(Fabric fabric) {
        if (fabric == null) {
            return null;
        }
        
        return StoreAdjustmentResponse.FabricBasicResponse.builder()
                .id(fabric.getId())
                .name(fabric.getName())
                .fabricCode(fabric.getFabricCode())
                .build();
    }
    
    private StoreAdjustmentResponse.ProductTypeBasicResponse toAdjustmentProductTypeBasic(ProductType productType) {
        if (productType == null) {
            return null;
        }
        
        return StoreAdjustmentResponse.ProductTypeBasicResponse.builder()
                .id(productType.getId())
                .name(productType.getName())
                .build();
    }
    
    private StoreAdjustmentResponse.UserBasicResponse toAdjustmentUserBasic(User user) {
        if (user == null) {
            return null;
        }
        
        return StoreAdjustmentResponse.UserBasicResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .build();
    }
}
