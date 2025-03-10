package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.request.WorkOrderRequest;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.dto.response.WorkOrderResponse;
import com.tripzin.eleganttex.dto.response.WorkOrderStats;
import com.tripzin.eleganttex.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {
    
    private final WorkOrderService workOrderService;
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<WorkOrderResponse>> getAllWorkOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam Map<String, String> params) {
        
        // Remove pagination and sorting params from filters
        params.remove("page");
        params.remove("size");
        params.remove("sortBy");
        params.remove("sortDir");
        
        return ResponseEntity.ok(workOrderService.getAllWorkOrders(page, size, sortBy, sortDir, params));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkOrderResponse> getWorkOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkOrderResponse> createWorkOrder(@Valid @RequestBody WorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.createWorkOrder(request));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkOrderResponse> updateWorkOrder(
            @PathVariable Long id, 
            @Valid @RequestBody WorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.updateWorkOrder(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteWorkOrder(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.deleteWorkOrder(id));
    }
    
    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkOrderStats> getWorkOrderStats() {
        return ResponseEntity.ok(workOrderService.getWorkOrderStats());
    }
}
