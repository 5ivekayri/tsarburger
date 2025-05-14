package org.example.server.mapper;

import org.example.server.model.Order;
import org.example.server.model.OrderItem;
import org.example.server.dto.OrderDTO;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderDTO toDTO(Order order) {
        if (order == null) {
            return null;
        }

        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setItems(order.getItems().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList()));
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setContactPhone(order.getContactPhone());
        dto.setOrderTime(order.getOrderTime());
        return dto;
    }

    public Order toEntity(OrderDTO dto) {
        if (dto == null) {
            return null;
        }

        Order order = new Order();
        order.setId(dto.getId());
        order.setUserId(dto.getUserId());
        order.setItems(dto.getItems().stream()
                .map(this::toItemEntity)
                .collect(Collectors.toList()));
        order.setTotalAmount(dto.getTotalAmount());
        order.setStatus(dto.getStatus() != null ? 
            Order.OrderStatus.valueOf(dto.getStatus()) : 
            Order.OrderStatus.PENDING);
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setContactPhone(dto.getContactPhone());
        order.setOrderTime(dto.getOrderTime());
        return order;
    }

    private OrderDTO.OrderItemDTO toItemDTO(OrderItem item) {
        if (item == null) {
            return null;
        }

        OrderDTO.OrderItemDTO dto = new OrderDTO.OrderItemDTO();
        dto.setProductId(item.getProductId());
        dto.setProductName(item.getProductName());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        return dto;
    }

    private OrderItem toItemEntity(OrderDTO.OrderItemDTO dto) {
        if (dto == null) {
            return null;
        }

        OrderItem item = new OrderItem();
        item.setProductId(dto.getProductId());
        item.setProductName(dto.getProductName());
        item.setQuantity(dto.getQuantity());
        item.setPrice(dto.getPrice());
        return item;
    }
} 