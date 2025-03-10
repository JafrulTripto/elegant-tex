package com.tripzin.eleganttex.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "work_orders")
@Getter
@Setter
@ToString(exclude = "user")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "wo_number")
    private String woNumber;
    
    @Column(name = "work_type")
    private String workType;
    
    private String client;
    
    @Column(name = "photo_count")
    private Integer photoCount;
    
    private String state;
    
    @Column(name = "client_due_date")
    private LocalDate clientDueDate;
    
    private String updater;
    
    @Column(name = "order_status")
    private String orderStatus;
    
    @Column(name = "remark_category")
    private String remarkCategory;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "number_of_bids")
    private Integer numberOfBids;
    
    @Column(name = "bid_amount")
    private BigDecimal bidAmount;
    
    @Column(name = "is_rush")
    private boolean isRush;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WorkOrder workOrder = (WorkOrder) o;
        return Objects.equals(id, workOrder.id) && 
               Objects.equals(woNumber, workOrder.woNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, woNumber);
    }
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
