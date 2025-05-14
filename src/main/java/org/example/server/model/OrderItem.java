package org.example.server.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "order_items")
public class OrderItem {
    @Id
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("productId")
    private String productId;
    
    @JsonProperty("productName")
    private String productName;
    
    @JsonProperty("quantity")
    private int quantity;
    
    @JsonProperty("price")
    private double price;
    
    @JsonProperty("preparationTime")
    private int preparationTime;

    @JsonIgnore
    public double getTotalPrice() {
        return price * quantity;
    }

    @JsonIgnore
    public void incrementQuantity() {
        this.quantity++;
    }

    @JsonIgnore
    public void decrementQuantity() {
        if (this.quantity > 0) {
            this.quantity--;
        }
    }

    public void setQuantity(int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }
        this.quantity = quantity;
    }
} 