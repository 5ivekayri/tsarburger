package org.example.server.dto;

import lombok.Data;

@Data
public class MenuItemDTO {
    private String id;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private boolean available;
} 