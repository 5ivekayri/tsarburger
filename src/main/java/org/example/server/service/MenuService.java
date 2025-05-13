package org.example.server.service;

import org.example.server.model.MenuItem;
import org.example.server.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public MenuService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public Optional<MenuItem> getMenuItem(String id) {
        return menuItemRepository.findById(id);
    }

    public MenuItem createMenuItem(MenuItem menuItem) {
        // Если imageBase64 не пустой, сохраняем его
        return menuItemRepository.save(menuItem);
    }

    public Optional<MenuItem> updateMenuItem(String id, MenuItem menuItem) {
        return menuItemRepository.findById(id)
                .map(existingItem -> {
                    existingItem.setName(menuItem.getName());
                    existingItem.setDescription(menuItem.getDescription());
                    existingItem.setPrice(menuItem.getPrice());
                    existingItem.setCategory(menuItem.getCategory());
                    existingItem.setAvailable(menuItem.isAvailable());
                    existingItem.setImageUrl(menuItem.getImageUrl());
                    existingItem.setImageBase64(menuItem.getImageBase64());
                    return menuItemRepository.save(existingItem);
                });
    }

    public boolean deleteMenuItem(String id) {
        if (menuItemRepository.existsById(id)) {
            menuItemRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Получить доступные позиции меню
    public List<MenuItem> getAvailableMenuItems() {
        return menuItemRepository.findAll().stream()
                .filter(MenuItem::isAvailable)
                .toList();
    }
} 