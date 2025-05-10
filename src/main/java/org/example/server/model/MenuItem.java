package org.example.server.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "menuItems")
public class MenuItem {
    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private boolean available;
} 