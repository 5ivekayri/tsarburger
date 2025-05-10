package org.example.server.controller;

import org.example.server.model.MenuItem;
import org.example.server.service.MenuService;
import org.example.server.dto.MenuItemDTO;
import org.example.server.mapper.MenuItemMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;
    private final MenuItemMapper menuItemMapper;

    public MenuController(MenuService menuService, MenuItemMapper menuItemMapper) {
        this.menuService = menuService;
        this.menuItemMapper = menuItemMapper;
    }

    // Получить все позиции меню
    @GetMapping
    public ResponseEntity<List<MenuItemDTO>> getAllMenuItems() {
        return ResponseEntity.ok(menuService.getAllMenuItems().stream()
                .map(menuItemMapper::toDTO)
                .toList());
    }

    // Получить доступные позиции меню
    @GetMapping("/available")
    public ResponseEntity<List<MenuItemDTO>> getAvailableMenuItems() {
        return ResponseEntity.ok(menuService.getAvailableMenuItems().stream()
                .map(menuItemMapper::toDTO)
                .toList());
    }

    // Получить позицию меню по ID
    @GetMapping("/{id}")
    public ResponseEntity<MenuItemDTO> getMenuItem(@PathVariable String id) {
        return menuService.getMenuItemById(id)
                .map(menuItemMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Добавить новую позицию в меню (только для админа)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItemDTO> addMenuItem(@RequestBody MenuItemDTO menuItemDTO) {
        MenuItem menuItem = menuItemMapper.toEntity(menuItemDTO);
        MenuItem saved = menuService.addMenuItem(menuItem);
        return ResponseEntity.ok(menuItemMapper.toDTO(saved));
    }

    // Обновить позицию в меню (только для админа)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItemDTO> updateMenuItem(@PathVariable String id, @RequestBody MenuItemDTO menuItemDTO) {
        MenuItem menuItem = menuItemMapper.toEntity(menuItemDTO);
        MenuItem updated = menuService.updateMenuItem(id, menuItem);
        return ResponseEntity.ok(menuItemMapper.toDTO(updated));
    }

    // Удалить позицию из меню (только для админа)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable String id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.ok().build();
    }
} 