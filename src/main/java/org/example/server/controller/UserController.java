package org.example.server.controller;

import org.example.server.model.User;
import org.example.server.service.UserService;
import org.example.server.dto.UserDTO;
import org.example.server.mapper.UserMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    // Регистрация нового пользователя
    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody UserDTO userDTO) {
        User user = userMapper.toEntity(userDTO);
        User saved = userService.registerUser(user);
        return ResponseEntity.ok(userMapper.toDTO(saved));
    }

    // Получить информацию о пользователе
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserDTO> getUser(@PathVariable String id) {
        return userService.findById(id)
                .map(userMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Обновить данные пользователя
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserDTO> updateUser(@PathVariable String id, @RequestBody UserDTO userDTO) {
        User user = userMapper.toEntity(userDTO);
        User updated = userService.updateUser(id, user);
        return ResponseEntity.ok(userMapper.toDTO(updated));
    }

    // Назначить пользователя администратором
    @PostMapping("/{id}/make-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> makeAdmin(@PathVariable String id) {
        return ResponseEntity.ok(userMapper.toDTO(userService.makeAdmin(id)));
    }
} 