package org.example.server.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private String id;
    private String userId;
    private List<OrderItemDTO> items;
    private double totalAmount;
    private String status;
    private String deliveryAddress;
    private String contactPhone;
    private int totalTime;
    private LocalDateTime orderTime;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDTO {
        private String productId;
        private String productName;
        private int quantity;
        private double price;

        public double getTotalPrice() {
            return price * quantity;
        }
    }

    public double calculateTotalAmount() {
        if (items == null) {
            return 0.0;
        }
        return items.stream()
                .mapToDouble(OrderItemDTO::getTotalPrice)
                .sum();
    }

    public int calculateTotalTime() {
        if (items == null) {
            return 0;
        }
        return items.stream()
                .mapToInt(item -> item.getQuantity() * 5) // Предполагаем, что каждый товар готовится 5 минут
                .sum();
    }
} 