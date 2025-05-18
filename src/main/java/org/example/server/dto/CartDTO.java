package org.example.server.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartDTO {
    private String id;
    private String userId;
    private List<CartItemDTO> items;
    private double totalPrice;
} 