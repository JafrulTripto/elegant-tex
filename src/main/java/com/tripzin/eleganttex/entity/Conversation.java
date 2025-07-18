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
@Table(name = "conversations",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"messaging_account_id", "messaging_customer_id"})
       })
@Getter
@Setter
@ToString(exclude = {"messagingAccount", "messagingCustomer", "messages"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "messaging_account_id", nullable = false)
    private MessagingAccount messagingAccount;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "messaging_customer_id", nullable = false)
    private MessagingCustomer messagingCustomer;
    
    @Size(max = 255)
    @Column(name = "conversation_name")
    private String conversationName;
    
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;
    
    @Builder.Default
    @Column(name = "unread_count")
    private Integer unreadCount = 0;
    
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Builder.Default
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
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
        Conversation that = (Conversation) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(messagingCustomer, that.messagingCustomer) &&
               Objects.equals(messagingAccount, that.messagingAccount);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, messagingCustomer, messagingAccount);
    }
}
