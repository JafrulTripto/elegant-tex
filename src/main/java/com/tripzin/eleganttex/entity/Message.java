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
@Table(name = "messages")
@Getter
@Setter
@ToString(exclude = {"conversation", "messagingAccount", "messagingCustomer"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "messaging_account_id", nullable = false)
    private MessagingAccount messagingAccount;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "messaging_customer_id", nullable = false)
    private MessagingCustomer messagingCustomer;
    
    @Size(max = 255)
    @Column(name = "platform_message_id")
    private String platformMessageId;
    
    @NotBlank
    @Size(max = 100)
    @Column(name = "sender_id", nullable = false)
    private String senderId;
    
    @NotBlank
    @Size(max = 100)
    @Column(name = "recipient_id", nullable = false)
    private String recipientId;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "message_type", nullable = false, length = 50)
    private MessageType messageType = MessageType.TEXT;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @NotNull
    @Column(name = "is_inbound", nullable = false)
    private Boolean isInbound;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private MessageStatus status = MessageStatus.SENT;
    
    @NotNull
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    
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
        Message message = (Message) o;
        return Objects.equals(id, message.id) &&
               Objects.equals(platformMessageId, message.platformMessageId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, platformMessageId);
    }
    
    public enum MessageType {
        TEXT, IMAGE, DOCUMENT, AUDIO, VIDEO, TEMPLATE, LOCATION, CONTACT
    }
    
    public enum MessageStatus {
        SENT, DELIVERED, READ, FAILED
    }
}
