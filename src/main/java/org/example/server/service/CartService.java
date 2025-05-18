package org.example.server.service;

import org.example.server.model.Cart;
import org.example.server.model.CartItem;
import org.example.server.model.MenuItem;
import org.example.server.repository.CartRepository;
import org.example.server.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class CartService {
    
    private final CartRepository cartRepository;
    private final MenuItemRepository menuItemRepository;

    @Autowired
    public CartService(CartRepository cartRepository, MenuItemRepository menuItemRepository) {
        this.cartRepository = cartRepository;
        this.menuItemRepository = menuItemRepository;
    }

    // Получить корзину пользователя
    public Cart getCart(String userId) {
        if (userId == null) {
            Cart emptyCart = new Cart();
            emptyCart.setItems(new ArrayList<>());
            emptyCart.setTotalPrice(0);
            return emptyCart;
        }
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });
    }

    // Добавить товар в корзину
    public Cart addToCart(String userId, String menuItemId, int quantity) {
        Cart cart = getCart(userId);
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Товар не найден"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getMenuItemId().equals(menuItemId))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setMenuItemId(menuItemId);
            newItem.setName(menuItem.getName());
            newItem.setPrice(menuItem.getPrice());
            newItem.setQuantity(quantity);
            cart.getItems().add(newItem);
        }

        updateCartTotal(cart);
        return cartRepository.save(cart);
    }

    // Удалить товар из корзины
    public Cart removeFromCart(String userId, String menuItemId) {
        Cart cart = getCart(userId);
        cart.getItems().removeIf(item -> item.getMenuItemId().equals(menuItemId));
        updateCartTotal(cart);
        return cartRepository.save(cart);
    }

    // Обновить количество товара в корзине
    public Cart updateItemQuantity(String userId, String menuItemId, int quantity) {
        Cart cart = getCart(userId);
        cart.getItems().stream()
                .filter(item -> item.getMenuItemId().equals(menuItemId))
                .findFirst()
                .ifPresent(item -> {
                    if (quantity <= 0) {
                        cart.getItems().remove(item);
                    } else {
                        item.setQuantity(quantity);
                    }
                });
        updateCartTotal(cart);
        return cartRepository.save(cart);
    }

    // Очистить корзину
    public void clearCart(String userId) {
        Cart cart = getCart(userId);
        cart.getItems().clear();
        cart.setTotalPrice(0);
        cartRepository.save(cart);
    }

    // Обновить общую стоимость корзины
    private void updateCartTotal(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        cart.setTotalPrice(total);
    }
} 