package org.example.server.service;

import org.example.server.model.Cart;
import org.example.server.model.Order;
import org.example.server.model.OrderItem;
import org.example.server.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final CartService cartService;

    @Autowired
    public OrderService(OrderRepository orderRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
    }

    // Создать новый заказ
    public Order createOrder(String userId, String deliveryAddress) {
        Cart cart = cartService.getCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Корзина пуста");
        }

       
        Order order = new Order();
        order.setUserId(userId);
        // Конвертируем CartItem в OrderItem
        List<OrderItem> orderItems = cart.getItems().stream()
            .map(cartItem -> {
                OrderItem orderItem = new OrderItem();
                orderItem.setProductId(cartItem.getMenuItemId());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getPrice());
                return orderItem;
            })
            .collect(Collectors.toList());
        order.setItems(orderItems);
        order.setTotalPrice(cart.getTotalPrice());
        order.setDeliveryAddress(deliveryAddress);
        order.setOrderTime(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING.name());

        // Очищаем корзину после создания заказа
        cartService.clearCart(userId);

        return orderRepository.save(order);
    }

    // Получить заказ по ID
    public Order getOrder(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Заказ не найден"));
    }

    // Получить все заказы пользователя
    public List<Order> getUserOrders(String userId) {
        return orderRepository.findByUserId(userId);
    }

    // Обновить статус заказа
    public Order updateOrderStatus(String orderId, Order.OrderStatus status) {
        Order order = getOrder(orderId);
        order.setStatus(status.name());
        return orderRepository.save(order);
    }

    // Получить все заказы (для администратора)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Отменить заказ
    public Order cancelOrder(String orderId) {
        Order order = getOrder(orderId);
        if (order.getStatus().equals(Order.OrderStatus.DELIVERED.name())) {
            throw new RuntimeException("Нельзя отменить доставленный заказ");
        }
        order.setStatus(Order.OrderStatus.CANCELLED.name());
        return orderRepository.save(order);
    }
} 