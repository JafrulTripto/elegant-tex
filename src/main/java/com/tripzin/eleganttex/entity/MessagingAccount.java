package com.tripzin.eleganttex.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "messaging_accounts",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"platform", "page_id", "phone_number_id"})
       })
@Getter
@Setter
@ToString(exclude = {"user", "conversations"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessagingAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false, length = 20)
    private MessagingPlatform platform;
    
    @NotBlank
    @Size(max = 100)
    @Column(name = "account_name", nullable = false)
    private String accountName;
    
    @Size(max = 100)
    @Column(name = "page_id")
    private String pageId;
    
    @Size(max = 100)
    @Column(name = "phone_number_id")
    private String phoneNumberId;
    
    @Size(max = 100)
    @Column(name = "business_account_id")
    private String businessAccountId;
    
    @NotBlank
    @Column(name = "access_token", nullable = false, columnDefinition = "TEXT")
    private String accessToken;
    
    @Size(max = 255)
    @Column(name = "webhook_verify_token")
    private String webhookVerifyToken;
    
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Builder.Default
    @OneToMany(mappedBy = "messagingAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> conversations = new ArrayList<>();
    
    @Builder.Default
    @OneToMany(mappedBy = "messagingAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();
    
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
        MessagingAccount that = (MessagingAccount) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(platform, that.platform) &&
               Objects.equals(pageId, that.pageId) &&
               Objects.equals(phoneNumberId, that.phoneNumberId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, platform, pageId, phoneNumberId);
    }
    
    public enum MessagingPlatform {
        FACEBOOK, WHATSAPP
    }
}
