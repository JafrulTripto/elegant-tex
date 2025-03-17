package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.entity.ProductType;
import com.tripzin.eleganttex.service.ProductTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/product-types")
public class ProductTypeController {

    private final ProductTypeService productTypeService;

    @Autowired
    public ProductTypeController(ProductTypeService productTypeService) {
        this.productTypeService = productTypeService;
    }

    @GetMapping
    public ResponseEntity<List<ProductType>> getAllProductTypes() {
        return ResponseEntity.ok(productTypeService.getAllProductTypes());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProductType>> getActiveProductTypes() {
        return ResponseEntity.ok(productTypeService.getActiveProductTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductType> getProductTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(productTypeService.getProductTypeById(id));
    }

    @PostMapping
    public ResponseEntity<ProductType> createProductType(@Valid @RequestBody ProductType productType) {
        ProductType createdProductType = productTypeService.createProductType(productType);
        return new ResponseEntity<>(createdProductType, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductType> updateProductType(
            @PathVariable Long id,
            @Valid @RequestBody ProductType productType) {
        return ResponseEntity.ok(productTypeService.updateProductType(id, productType));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductType(@PathVariable Long id) {
        productTypeService.deleteProductType(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ProductType> toggleProductTypeActive(@PathVariable Long id) {
        return ResponseEntity.ok(productTypeService.toggleProductTypeActive(id));
    }
}
