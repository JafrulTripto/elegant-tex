package com.tripzin.eleganttex.service.mapper;

import com.tripzin.eleganttex.dto.response.CustomerResponse;
import com.tripzin.eleganttex.dto.response.OrderProductImageResponse;
import com.tripzin.eleganttex.dto.response.OrderProductResponse;
import com.tripzin.eleganttex.dto.response.OrderResponse;
import com.tripzin.eleganttex.dto.response.OrderStatusHistoryResponse;
import com.tripzin.eleganttex.entity.Order;
import com.tripzin.eleganttex.entity.OrderProduct;
import com.tripzin.eleganttex.entity.OrderProductImage;
import com.tripzin.eleganttex.entity.OrderStatusHistory;
import com.tripzin.eleganttex.mapper.AddressResponseMapper;
import com.tripzin.eleganttex.repository.OrderProductImageRepository;
import com.tripzin.eleganttex.repository.OrderStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper class for converting between Order entities and DTOs
 */
@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderProductImageRepository orderProductImageRepository;

    /**
     * Maps an Order entity to an OrderResponse DTO
     */
    public OrderResponse mapOrderToResponse(Order order) {
        // Map marketplace if it exists
        OrderResponse.MarketplaceResponse marketplaceResponse = null;
        if (order.getMarketplace() != null) {
            marketplaceResponse = OrderResponse.MarketplaceResponse.builder()
                    .id(order.getMarketplace().getId())
                    .name(order.getMarketplace().getName())
                    .pageUrl(order.getMarketplace().getPageUrl())
                    .build();
        }
        
        // Map customer
        CustomerResponse customerResponse = CustomerResponse.builder()
                .id(order.getCustomer().getId())
                .name(order.getCustomer().getName())
                .phone(order.getCustomer().getPhone())
                .address( AddressResponseMapper.mapToAddressResponse(order.getCustomer().getAddress()))
                .alternativePhone(order.getCustomer().getAlternativePhone())
                .facebookId(order.getCustomer().getFacebookId())
                .createdAt(order.getCustomer().getCreatedAt())
                .updatedAt(order.getCustomer().getUpdatedAt())
                .build();
        
        // Map created by user
        OrderResponse.UserResponse createdByDto = OrderResponse.UserResponse.builder()
                .id(order.getCreatedBy().getId())
                .firstName(order.getCreatedBy().getFirstName())
                .lastName(order.getCreatedBy().getLastName())
                .email(order.getCreatedBy().getEmail())
                .build();
        
        // Map products
        List<OrderProductResponse> productResponses = order.getProducts().stream()
                .map(this::mapOrderProductToResponse)
                .collect(Collectors.toList());
        
        // Map status history
        List<OrderStatusHistoryResponse> statusHistoryResponses = orderStatusHistoryRepository
                .findByOrderIdWithUserOrderByTimestampDesc(order.getId())
                .stream()
                .map(this::mapOrderStatusHistoryToResponse)
                .collect(Collectors.toList());
        
        // Calculate total amount
        BigDecimal totalAmount = order.getProducts().stream()
                .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(order.getDeliveryCharge());
        
        // Build response
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .orderType(order.getOrderType().getDisplayName())
                .businessUnit(order.getBusinessUnit().toString())
                .marketplace(marketplaceResponse)
                .customer(customerResponse)
                .deliveryChannel(order.getDeliveryChannel())
                .deliveryCharge(order.getDeliveryCharge())
                .deliveryDate(order.getDeliveryDate())
                .status(order.getStatus().getDisplayName())
                .totalAmount(totalAmount)
                .createdBy(createdByDto)
                .products(productResponses)
                .statusHistory(statusHistoryResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
    
    /**
     * Maps an OrderProduct entity to an OrderProductResponse DTO
     */
    public OrderProductResponse mapOrderProductToResponse(OrderProduct product) {
        // Map fabric
        OrderProductResponse.FabricResponse fabricResponse = OrderProductResponse.FabricResponse.builder()
                .id(product.getFabric().getId())
                .name(product.getFabric().getName())
                .imageId(product.getFabric().getImageId())
                .build();
        
        // Map images
        List<OrderProductImageResponse> imageResponses = orderProductImageRepository
                .findByOrderProductId(product.getId())
                .stream()
                .map(this::mapOrderProductImageToResponse)
                .collect(Collectors.toList());
        
        // Calculate subtotal
        BigDecimal subtotal = product.getPrice().multiply(new BigDecimal(product.getQuantity()));
        
        // Map product type
        OrderProductResponse.ProductTypeResponse productTypeResponse = OrderProductResponse.ProductTypeResponse.builder()
                .id(product.getProductType().getId())
                .name(product.getProductType().getName())
                .build();
        
        // Build response
        return OrderProductResponse.builder()
                .id(product.getId())
                .productType(productTypeResponse)
                .fabric(fabricResponse)
                .quantity(product.getQuantity())
                .price(product.getPrice())
                .description(product.getDescription())
                .subtotal(subtotal)
                .images(imageResponses)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
    
    /**
     * Maps an OrderProductImage entity to an OrderProductImageResponse DTO
     */
    public OrderProductImageResponse mapOrderProductImageToResponse(OrderProductImage image) {
        return OrderProductImageResponse.builder()
                .id(image.getId())
                .imageId(image.getImageId())
                .imageUrl(image.getImageUrl())
                .createdAt(image.getCreatedAt())
                .updatedAt(image.getUpdatedAt())
                .build();
    }
    
    /**
     * Maps an OrderStatusHistory entity to an OrderStatusHistoryResponse DTO
     */
    public OrderStatusHistoryResponse mapOrderStatusHistoryToResponse(OrderStatusHistory history) {
        // Map updated by user
        OrderStatusHistoryResponse.UserResponse updatedByDto = OrderStatusHistoryResponse.UserResponse.builder()
                .id(history.getUpdatedBy().getId())
                .firstName(history.getUpdatedBy().getFirstName())
                .lastName(history.getUpdatedBy().getLastName())
                .email(history.getUpdatedBy().getEmail())
                .build();
        
        // Build response
        return OrderStatusHistoryResponse.builder()
                .id(history.getId())
                .status(history.getStatus().getDisplayName())
                .notes(history.getNotes())
                .updatedBy(updatedByDto)
                .timestamp(history.getTimestamp())
                .createdAt(history.getCreatedAt())
                .updatedAt(history.getUpdatedAt())
                .build();
    }
}
