package org.example.server.mapper;

import org.example.server.dto.OrderDTO;
import org.example.server.model.Order;
import org.example.server.model.OrderItem;
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
                .map(item -> {
                    OrderDTO.OrderItemDTO itemDTO = new OrderDTO.OrderItemDTO();
                    itemDTO.setProductId(item.getProductId());
                    itemDTO.setProductName(item.getProductName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPrice(item.getPrice());
                    return itemDTO;
                })
                .collect(Collectors.toList()));
        dto.setTotalAmount(order.getTotalPrice());
        dto.setStatus(order.getStatus());
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
                .map(itemDTO -> {
                    OrderItem item = new OrderItem();
                    item.setProductId(itemDTO.getProductId());
                    item.setProductName(itemDTO.getProductName());
                    item.setQuantity(itemDTO.getQuantity());
                    item.setPrice(itemDTO.getPrice());
                    return item;
                })
                .collect(Collectors.toList()));
        order.setTotalPrice(dto.getTotalAmount());
        order.setStatus(dto.getStatus());
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setContactPhone(dto.getContactPhone());
        order.setOrderTime(dto.getOrderTime());
        return order;
    }
} 