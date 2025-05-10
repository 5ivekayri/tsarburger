package org.example.server.mapper;

import org.example.server.dto.CartDTO;
import org.example.server.dto.CartItemDTO;
import org.example.server.model.Cart;
import org.example.server.model.CartItem;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {
    public CartDTO toDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUserId());
        dto.setItems(cart.getItems().stream().map(this::toItemDTO).collect(Collectors.toList()));
        dto.setTotalPrice(cart.getTotalPrice());
        return dto;
    }

    public CartItemDTO toItemDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setMenuItemId(item.getMenuItemId());
        dto.setName(item.getName());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        return dto;
    }

    public CartItem toItemEntity(CartItemDTO dto) {
        CartItem item = new CartItem();
        item.setMenuItemId(dto.getMenuItemId());
        item.setName(dto.getName());
        item.setQuantity(dto.getQuantity());
        item.setPrice(dto.getPrice());
        return item;
    }
} 