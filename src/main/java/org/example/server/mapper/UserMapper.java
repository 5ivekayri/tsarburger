package org.example.server.mapper;

import org.example.server.dto.UserDTO;
import org.example.server.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setAddress(user.getAddress());
        dto.setRoles(user.getRoles());
        dto.setEnabled(user.isEnabled());
        dto.setPassword(user.getPassword());
        return dto;
    }

    public User toEntity(UserDTO dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setAddress(dto.getAddress());
        user.setRoles(dto.getRoles());
        user.setEnabled(dto.isEnabled());
        user.setPassword(dto.getPassword());
        return user;
    }
} 