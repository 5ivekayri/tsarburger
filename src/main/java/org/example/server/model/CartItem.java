package org.example.server.model;

import lombok.Data;

@Data
public class CartItem {
    private String menuItemId;
    private String name;
    private int quantity;
    private double price;
}
