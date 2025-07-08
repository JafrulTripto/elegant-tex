package com.tripzin.eleganttex.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "message_attachments")
@Getter
@Setter
@ToString(exclude = {"message"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageAttachment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "attachment_type", nullable = false, length = 20)
    private AttachmentType attachmentType;
    
    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;
    
    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Size(max = 100)
    @Column(name = "mime_type")
    private String mimeType;
    
    @Size(max = 255)
    @Column(name = "original_filename")
    private String originalFilename;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessageAttachment that = (MessageAttachment) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(fileUrl, that.fileUrl) &&
               Objects.equals(filePath, that.filePath);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, fileUrl, filePath);
    }
    
    public enum AttachmentType {
        IMAGE, DOCUMENT, AUDIO, VIDEO
    }
}
