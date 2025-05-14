package org.example.server.controller;

import org.example.server.model.Order;
import org.example.server.service.OrderService;
import org.example.server.dto.OrderDTO;
import org.example.server.dto.CreateOrderRequest;
import org.example.server.mapper.OrderMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    public OrderController(OrderService orderService, OrderMapper orderMapper) {
        this.orderService = orderService;
        this.orderMapper = orderMapper;
    }

    // Создать новый заказ
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> createOrder(
            @RequestAttribute("userId") String userId,
            @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderMapper.toDTO(orderService.createOrder(userId, request.getDeliveryAddress())));
    }

    // Получить заказ по ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @orderService.getOrder(#id).userId == authentication.principal.id")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(orderMapper.toDTO(orderService.getOrder(id)));
    }

    // Получить все заказы пользователя
    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderDTO>> getUserOrders(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(orderService.getUserOrders(userId).stream()
                .map(orderMapper::toDTO)
                .toList());
    }

    // Получить все заказы (для администратора)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders().stream()
                .map(orderMapper::toDTO)
                .toList());
    }

    // Обновить статус заказа (для администратора)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable String id,
            @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderMapper.toDTO(orderService.updateOrderStatus(id, status)));
    }

    // Отменить заказ
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or @orderService.getOrder(#id).userId == authentication.principal.id")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable String id) {
        return ResponseEntity.ok(orderMapper.toDTO(orderService.cancelOrder(id)));
    }
} 