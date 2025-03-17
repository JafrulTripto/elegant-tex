package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.entity.ProductType;
import com.tripzin.eleganttex.exception.BadRequestException;
import com.tripzin.eleganttex.exception.AppException;
import com.tripzin.eleganttex.repository.ProductTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductTypeServiceImpl implements ProductTypeService {

    private final ProductTypeRepository productTypeRepository;

    @Autowired
    public ProductTypeServiceImpl(ProductTypeRepository productTypeRepository) {
        this.productTypeRepository = productTypeRepository;
    }

    @Override
    public List<ProductType> getAllProductTypes() {
        return productTypeRepository.findAll();
    }

    @Override
    public List<ProductType> getActiveProductTypes() {
        return productTypeRepository.findByActive(true);
    }

    @Override
    public ProductType getProductTypeById(Long id) {
        return productTypeRepository.findById(id)
                .orElseThrow(() -> new AppException("Product type not found with id: " + id, HttpStatus.NOT_FOUND));
    }

    @Override
    public ProductType getProductTypeByName(String name) {
        return productTypeRepository.findByName(name)
                .orElseThrow(() -> new AppException("Product type not found with name: " + name, HttpStatus.NOT_FOUND));
    }

    @Override
    @Transactional
    public ProductType createProductType(ProductType productType) {
        // Check if product type with the same name already exists
        if (productTypeRepository.existsByName(productType.getName())) {
            throw new BadRequestException("Product type with name '" + productType.getName() + "' already exists");
        }
        
        // Set active to true by default if not specified
        if (productType.getActive() == null) {
            productType.setActive(true);
        }
        
        return productTypeRepository.save(productType);
    }

    @Override
    @Transactional
    public ProductType updateProductType(Long id, ProductType productTypeDetails) {
        ProductType productType = getProductTypeById(id);
        
        // Check if another product type with the same name already exists
        if (!productType.getName().equals(productTypeDetails.getName()) && 
            productTypeRepository.existsByName(productTypeDetails.getName())) {
            throw new BadRequestException("Product type with name '" + productTypeDetails.getName() + "' already exists");
        }
        
        productType.setName(productTypeDetails.getName());
        
        if (productTypeDetails.getActive() != null) {
            productType.setActive(productTypeDetails.getActive());
        }
        
        return productTypeRepository.save(productType);
    }

    @Override
    @Transactional
    public void deleteProductType(Long id) {
        ProductType productType = getProductTypeById(id);
        productTypeRepository.delete(productType);
    }

    @Override
    @Transactional
    public ProductType toggleProductTypeActive(Long id) {
        ProductType productType = getProductTypeById(id);
        productType.setActive(!productType.getActive());
        return productTypeRepository.save(productType);
    }

    @Override
    public boolean existsByName(String name) {
        return productTypeRepository.existsByName(name);
    }
}
