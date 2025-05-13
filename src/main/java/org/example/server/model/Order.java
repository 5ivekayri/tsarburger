package org.example.server.model;

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
    private String id;
    
    @Indexed
    private String userId;
     
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    
    @Builder.Default
    private double totalPrice = 0.0;
    
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;
    
    private String deliveryAddress;
    private String contactPhone;
    
    @Builder.Default
    private LocalDateTime orderTime = LocalDateTime.now();
    
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PREPARING,
        READY_FOR_DELIVERY,
        DELIVERING,
        DELIVERED,
        CANCELLED
    }

    public void addItem(OrderItem item) {
        if (items == null) {
            items = new ArrayList<>();
        }
        items.add(item);
        recalculateTotalPrice();
    }

    public void removeItem(OrderItem item) {
        if (items != null) {
            items.remove(item);
            recalculateTotalPrice();
        }
    }

    public void recalculateTotalPrice() {
        this.totalPrice = items.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    public boolean isCompleted() {
        return OrderStatus.DELIVERED.name().equals(status.name());
    }

    public boolean isCancelled() {
        return OrderStatus.CANCELLED.name().equals(status.name());
    }

    public boolean canBeCancelled() {
        return !isCompleted() && !isCancelled();
    }

    // Геттеры и сеттеры
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status.name();
    }

    public void setStatus(String status) {
        this.status = OrderStatus.valueOf(status);
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public LocalDateTime getOrderTime() {
        return orderTime;
    }

    public void setOrderTime(LocalDateTime orderTime) {
        this.orderTime = orderTime;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 