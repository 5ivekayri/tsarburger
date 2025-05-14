package org.example.server.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "orders")
public class Order {
    @Id
    @JsonProperty("id")
    private String id;
    
    @Indexed
    @JsonProperty("userId")
    private String userId;
     
    @Builder.Default
    @JsonProperty("items")
    private List<OrderItem> items = new ArrayList<>();
    
    @Builder.Default
    @JsonProperty("totalAmount")
    private double totalAmount = 0.0;
    
    @Builder.Default
    @JsonProperty("status")
    private OrderStatus status = OrderStatus.PENDING;
    
    @JsonProperty("deliveryAddress")
    private String deliveryAddress;
    
    @JsonProperty("contactPhone")
    private String contactPhone;
    
    @Builder.Default
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("orderTime")
    private LocalDateTime orderTime = LocalDateTime.now();
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PREPARING,
        READY_FOR_DELIVERY,
        DELIVERING,
        DELIVERED,
        CANCELLED;

        @JsonValue
        public String toValue() {
            return name();
        }

        @JsonCreator
        public static OrderStatus forValue(String value) {
            return value == null ? null : OrderStatus.valueOf(value);
        }
    }

    public void addItem(OrderItem item) {
        if (items == null) {
            items = new ArrayList<>();
        }
        items.add(item);
        recalculateTotalAmount();
    }

    public void removeItem(OrderItem item) {
        if (items != null) {
            items.remove(item);
            recalculateTotalAmount();
        }
    }

    @JsonIgnore
    public void recalculateTotalAmount() {
        this.totalAmount = items.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    @JsonIgnore
    public boolean isCompleted() {
        return status == OrderStatus.DELIVERED;
    }

    @JsonIgnore
    public boolean isCancelled() {
        return status == OrderStatus.CANCELLED;
    }

    @JsonIgnore
    public boolean canBeCancelled() {
        return !isCompleted() && !isCancelled();
    }
} 