package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.request.OrderRequest;
import com.tripzin.eleganttex.dto.response.OrderResponse;
import com.tripzin.eleganttex.security.UserSecurity;
import com.tripzin.eleganttex.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserSecurity userSecurity;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestPart("orderRequest") OrderRequest orderRequest,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userSecurity.getUserIdFromUserDetails(userDetails);
        OrderResponse order = orderService.createOrder(orderRequest, userId, files);
        return ResponseEntity.ok(order);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    public ResponseEntity<OrderResponse> updateOrder(
            @PathVariable Long id,
            @Valid @RequestPart("orderRequest") OrderRequest orderRequest,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userSecurity.getUserIdFromUserDetails(userDetails);
        OrderResponse order = orderService.updateOrder(id, orderRequest, userId, files);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<OrderResponse> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/marketplace/{marketplaceId}")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<Page<OrderResponse>> getOrdersByMarketplaceId(
            @PathVariable Long marketplaceId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<OrderResponse> orders = orderService.getOrdersByMarketplaceId(marketplaceId, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<Page<OrderResponse>> getOrdersByStatus(
            @PathVariable String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<OrderResponse> orders = orderService.getOrdersByStatus(status, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/delivery-date")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<Page<OrderResponse>> getOrdersByDeliveryDateBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<OrderResponse> orders = orderService.getOrdersByDeliveryDateBetween(startDate, endDate, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/filter")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<Page<OrderResponse>> getOrdersByFilters(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long marketplaceId,
            @RequestParam(required = false) String customerName,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<OrderResponse> orders = orderService.getOrdersByFilters(status, startDate, endDate, marketplaceId, customerName, pageable);
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userSecurity.getUserIdFromUserDetails(userDetails);
        OrderResponse order = orderService.updateOrderStatus(id, status, notes, userId);
        return ResponseEntity.ok(order);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ORDER_DELETE')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<Resource> generateOrderPdf(@PathVariable Long id) {
        ResponseEntity<Resource> resource = orderService.generateOrderPdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"order-" + id + ".pdf\"")
                .body(resource.getBody());
    }

    @GetMapping("/excel")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<Resource> generateOrdersExcel(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ResponseEntity<Resource> resource = orderService.generateOrdersExcel(status, startDate, endDate);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"orders.xlsx\"")
                .body(resource.getBody());
    }

    @GetMapping("/status-counts")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<List<Map<String, Object>>> getOrderStatusCounts(
            @RequestParam(defaultValue = "true") boolean currentMonth) {
        List<Map<String, Object>> statusCounts = orderService.getOrderStatusCounts(currentMonth);
        return ResponseEntity.ok(statusCounts);
    }
    
    @GetMapping("/user-statistics")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<List<Map<String, Object>>> getUserOrderStatistics(
            @RequestParam(defaultValue = "true") boolean currentMonth) {
        List<Map<String, Object>> userStats = orderService.getUserOrderStatistics(currentMonth);
        return ResponseEntity.ok(userStats);
    }
    
    @GetMapping("/marketplace-statistics")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<List<Map<String, Object>>> getMarketplaceOrderStatistics(
            @RequestParam(defaultValue = "true") boolean currentMonth) {
        List<Map<String, Object>> marketplaceStats = orderService.getMarketplaceOrderStatistics(currentMonth);
        return ResponseEntity.ok(marketplaceStats);
    }
    
    /**
     * Get similar orders (returned or cancelled) based on product type and fabric
     * @param id the order ID to find similar orders for
     * @param limit maximum number of similar orders to return (default: 5)
     * @return list of similar orders
     */
    @GetMapping("/{id}/similar")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<List<OrderResponse>> getSimilarOrders(
            @PathVariable Long id,
            @RequestParam(defaultValue = "5") int limit) {
        List<OrderResponse> similarOrders = orderService.findSimilarOrders(id, limit);
        return ResponseEntity.ok(similarOrders);
    }
    
    /**
     * Get monthly order data for chart display
     * @param startDate optional start date (defaults to one month ago)
     * @param endDate optional end date (defaults to today)
     * @return list of daily order counts
     */
    @GetMapping("/monthly-data")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyOrderData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        // If dates not provided, default to last month
        if (startDate == null) {
            LocalDate now = LocalDate.now();
            endDate = now;
            startDate = now.minusMonths(1);
        }
        
        List<Map<String, Object>> monthlyData = orderService.getMonthlyOrderData(startDate, endDate);
        return ResponseEntity.ok(monthlyData);
    }
}
