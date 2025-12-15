package com.tripzin.eleganttex.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "store_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "sku", unique = true, nullable = false, length = 50)
    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fabric_id", nullable = false)
    private Fabric fabric;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_type_id", nullable = false)
    private ProductType productType;

    @Column(name = "style_code")
    private String styleCode;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "quality", nullable = false, length = 20)
    private StoreItemQuality quality;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private StoreItemSource sourceType;

    @Column(name = "source_order_product_id")
    private Long sourceOrderProductId;

    @Column(name = "source_order_number", length = 20)
    private String sourceOrderNumber;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by", nullable = false)
    private User addedBy;

    @OneToMany(mappedBy = "storeItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StoreTransaction> transactions = new ArrayList<>();

    @OneToMany(mappedBy = "storeItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StoreItemImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods
    public void addTransaction(StoreTransaction transaction) {
        transactions.add(transaction);
        transaction.setStoreItem(this);
    }

    public void addImage(StoreItemImage image) {
        images.add(image);
        image.setStoreItem(this);
    }

    public void removeImage(StoreItemImage image) {
        images.remove(image);
        image.setStoreItem(null);
    }
}
