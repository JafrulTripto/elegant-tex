package com.tripzin.eleganttex.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "fabrics")
@Getter
@Setter
@ToString(exclude = "tags")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Fabric {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String name;
    
    @Column(name = "fabric_code", unique = true)
    private String fabricCode;
    
    @Column(name = "image_id")
    private Long imageId;
    
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "fabric_tags",
        joinColumns = @JoinColumn(name = "fabric_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Fabric fabric = (Fabric) o;
        return Objects.equals(id, fabric.id) && 
               Objects.equals(name, fabric.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
    
    public void addTag(Tag tag) {
        this.tags.add(tag);
    }
    
    public void removeTag(Tag tag) {
        this.tags.remove(tag);
    }
}
