package com.tripzin.eleganttex.util;

import com.tripzin.eleganttex.entity.Fabric;
import com.tripzin.eleganttex.entity.ProductType;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for generating SKUs for store items
 */
public class SkuGenerator {
    
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    
    /**
     * Generate a SKU for a store item
     * Format: ST-{fabricCode}-{productTypeAbbrev}-{timestamp}
     * Example: ST-FC001-SOF-20251213143022
     * 
     * @param fabric the fabric
     * @param productType the product type
     * @return generated SKU
     */
    public static String generateSku(Fabric fabric, ProductType productType) {
        String fabricCode = fabric.getFabricCode() != null ? fabric.getFabricCode() : "UNK";
        String productTypeCode = generateProductTypeCode(productType.getName());
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
        
        return String.format("ST-%s-%s-%s", fabricCode, productTypeCode, timestamp);
    }
    
    /**
     * Generate a 3-letter abbreviation for product type name
     * 
     * @param productTypeName the product type name
     * @return 3-letter code
     */
    private static String generateProductTypeCode(String productTypeName) {
        if (productTypeName == null || productTypeName.isEmpty()) {
            return "UNK";
        }
        
        // Remove common words and take first 3 characters
        String cleaned = productTypeName
            .replaceAll("(?i)cover", "")
            .trim();
        
        if (cleaned.isEmpty()) {
            cleaned = productTypeName;
        }
        
        // Take first 3 letters, uppercase
        if (cleaned.length() >= 3) {
            return cleaned.substring(0, 3).toUpperCase();
        } else {
            return (cleaned + "XXX").substring(0, 3).toUpperCase();
        }
    }
}
