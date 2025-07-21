package com.tripzin.eleganttex.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "addresses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "division_id", nullable = false)
    private Division division;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upazila_id", nullable = false)
    private Upazila upazila;

    @Column(name = "address_line", nullable = false, length = 500)
    private String addressLine;

    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @Column(name = "landmark", length = 255)
    private String landmark;

    @Enumerated(EnumType.STRING)
    @Column(name = "address_type", length = 50)
    @Builder.Default
    private AddressType addressType = AddressType.PRIMARY;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper method to get formatted address
    public String getFormattedAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(addressLine);
        
        if (upazila != null && upazila.getName() != null) {
            sb.append(", ").append(upazila.getName());
        }
        
        if (district != null && district.getName() != null) {
            sb.append(", ").append(district.getName());
        }
        
        if (division != null && division.getName() != null) {
            sb.append(", ").append(division.getName());
        }
        
        return sb.toString();
    }
}
