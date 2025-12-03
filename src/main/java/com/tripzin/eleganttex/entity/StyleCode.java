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
@Table(name = "style_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StyleCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "code", nullable = false, unique = true)
    private String code;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
