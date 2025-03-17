package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.entity.ProductType;

import java.util.List;

public interface ProductTypeService {
    
    List<ProductType> getAllProductTypes();
    
    List<ProductType> getActiveProductTypes();
    
    ProductType getProductTypeById(Long id);
    
    ProductType getProductTypeByName(String name);
    
    ProductType createProductType(ProductType productType);
    
    ProductType updateProductType(Long id, ProductType productType);
    
    void deleteProductType(Long id);
    
    ProductType toggleProductTypeActive(Long id);
    
    boolean existsByName(String name);
}
