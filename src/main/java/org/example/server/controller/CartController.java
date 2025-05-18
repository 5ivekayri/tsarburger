package org.example.server.controller;


import org.example.server.service.CartService;
import org.example.server.dto.CartDTO;
import org.example.server.mapper.CartMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final CartMapper cartMapper;

    public CartController(CartService cartService, CartMapper cartMapper) {
        this.cartService = cartService;
        this.cartMapper = cartMapper;
    }

    // Получить корзину пользователя
    @GetMapping
    public ResponseEntity<CartDTO> getCart(@RequestAttribute(value = "userId", required = false) String userId) {
        return ResponseEntity.ok(cartMapper.toDTO(cartService.getCart(userId)));
    }

    // Добавить товар в корзину
    @PostMapping("/items")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> addToCart(
            @RequestAttribute("userId") String userId,
            @RequestBody Map<String, Object> payload) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        String menuItemId = (String) payload.get("menuItemId");
        if (menuItemId == null) {
            return ResponseEntity.badRequest().build();
        }
        int quantity = (int) payload.getOrDefault("quantity", 1);
        return ResponseEntity.ok(cartMapper.toDTO(cartService.addToCart(userId, menuItemId, quantity)));
    }

    // Удалить товар из корзины
    @DeleteMapping("/items/{menuItemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> removeFromCart(
            @RequestAttribute("userId") String userId,
            @PathVariable String menuItemId) {
        return ResponseEntity.ok(cartMapper.toDTO(cartService.removeFromCart(userId, menuItemId)));
    }

    // Обновить количество товара в корзине
    @PutMapping("/items/{menuItemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> updateItemQuantity(
            @RequestAttribute("userId") String userId,
            @PathVariable String menuItemId,
            @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");
        if (quantity == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cartMapper.toDTO(cartService.updateItemQuantity(userId, menuItemId, quantity)));
    }

    // Очистить корзину
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> clearCart(@RequestAttribute("userId") String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }
} 