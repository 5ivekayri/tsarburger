package org.example.server.config;

import org.example.server.model.MenuItem;
import org.example.server.repository.MenuItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    public CommandLineRunner initData(MenuItemRepository menuItemRepository) {
        return args -> {
            if (menuItemRepository.count() == 0) {
                MenuItem classicBurger = new MenuItem();
                classicBurger.setName("Классический бургер");
                classicBurger.setDescription("Говядина, сыр, салат, помидор, булочка");
                classicBurger.setPrice(350);
                classicBurger.setImageUrl("");
                classicBurger.setAvailable(true);
                menuItemRepository.save(classicBurger);

                MenuItem cheeseburger = new MenuItem();
                cheeseburger.setName("Чизбургер");
                cheeseburger.setDescription("Говядина, сыр, булочка");
                cheeseburger.setPrice(300);
                cheeseburger.setImageUrl("");
                cheeseburger.setAvailable(true);
                menuItemRepository.save(cheeseburger);
            }
        };
    }
} 