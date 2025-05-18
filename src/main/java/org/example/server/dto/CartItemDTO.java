package org.example.server.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    private String menuItemId;
    private String name;
    private int quantity;
    private double price;
} 