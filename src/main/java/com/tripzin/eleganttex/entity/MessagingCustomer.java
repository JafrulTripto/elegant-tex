package com.tripzin.eleganttex.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "messaging_customers",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"platform_customer_id", "platform"})
       })
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessagingCustomer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 255)
    @Column(name = "platform_customer_id", nullable = false)
    private String platformCustomerId;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false)
    private MessagingPlatform platform;
    
    @Size(max = 255)
    @Column(name = "display_name")
    private String displayName;
    
    @Size(max = 100)
    @Column(name = "first_name")
    private String firstName;
    
    @Size(max = 100)
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "profile_picture_url", columnDefinition = "TEXT")
    private String profilePictureUrl;
    
    @Size(max = 50)
    @Column(name = "phone")
    private String phone;
    
    @Size(max = 255)
    @Column(name = "email")
    private String email;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    @Builder.Default
    @Column(name = "profile_fetched")
    private Boolean profileFetched = false;
    
    @Column(name = "profile_fetch_attempted_at")
    private LocalDateTime profileFetchAttemptedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum MessagingPlatform {
        FACEBOOK,
        WHATSAPP
    }
    
    /**
     * Get the best available display name
     */
    public String getBestDisplayName() {
        if (displayName != null && !displayName.trim().isEmpty()) {
            return displayName;
        }
        
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        }
        
        if (firstName != null) {
            return firstName;
        }
        
        if (lastName != null) {
            return lastName;
        }
        
        return platform.name() + " User";
    }
    
    /**
     * Check if profile information is complete
     */
    public boolean hasCompleteProfile() {
        return firstName != null && lastName != null && profileFetched;
    }
    
    /**
     * Check if customer has provided contact information
     */
    public boolean hasContactInfo() {
        return (phone != null && !phone.trim().isEmpty()) || 
               (email != null && !email.trim().isEmpty());
    }
    
    /**
     * Update profile information from API response
     */
    public void updateProfileFromApi(String firstName, String lastName, String profilePictureUrl) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.profilePictureUrl = profilePictureUrl;
        this.displayName = buildDisplayName(firstName, lastName);
        this.profileFetched = true;
        this.profileFetchAttemptedAt = LocalDateTime.now();
    }
    
    /**
     * Mark profile fetch as attempted (even if failed)
     */
    public void markProfileFetchAttempted() {
        this.profileFetchAttemptedAt = LocalDateTime.now();
    }
    
    /**
     * Check if profile fetch should be retried
     */
    public boolean shouldRetryProfileFetch() {
        if (profileFetched) {
            return false;
        }
        
        if (profileFetchAttemptedAt == null) {
            return true;
        }
        
        // Retry after 24 hours
        return profileFetchAttemptedAt.isBefore(LocalDateTime.now().minusHours(24));
    }
    
    private String buildDisplayName(String firstName, String lastName) {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        } else {
            return platform.name() + " User";
        }
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessagingCustomer that = (MessagingCustomer) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(platformCustomerId, that.platformCustomerId) &&
               platform == that.platform;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, platformCustomerId, platform);
    }
}
