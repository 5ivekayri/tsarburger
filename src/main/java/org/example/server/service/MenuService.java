package org.example.server.service;

import org.example.server.model.MenuItem;
import org.example.server.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MenuService {
    
    private final MenuItemRepository menuItemRepository;

    @Autowired
    public MenuService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    // Получить все позиции меню
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    // Получить позицию меню по ID
    public Optional<MenuItem> getMenuItemById(String id) {
        return menuItemRepository.findById(id);
    }

    // Добавить новую позицию в меню
    public MenuItem addMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    // Обновить существующую позицию в меню
    public MenuItem updateMenuItem(String id, MenuItem menuItem) {
        menuItem.setId(id);
        return menuItemRepository.save(menuItem);
    }

    // Удалить позицию из меню
    public void deleteMenuItem(String id) {
        menuItemRepository.deleteById(id);
    }

    // Получить доступные позиции меню
    public List<MenuItem> getAvailableMenuItems() {
        return menuItemRepository.findAll().stream()
                .filter(MenuItem::isAvailable)
                .toList();
    }
} 