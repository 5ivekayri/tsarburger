package org.example.server.config;

import org.example.server.model.MenuItem;
import org.example.server.repository.MenuItemRepository;
import org.example.server.model.User;
import org.example.server.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.HashSet;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(MenuItemRepository menuItemRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Очищаем существующие данные
            menuItemRepository.deleteAll();

            // Бургеры
            MenuItem classicBurger = new MenuItem();
            classicBurger.setName("Классический бургер");
            classicBurger.setDescription("Сочная говяжья котлета, свежие овощи, фирменный соус");
            classicBurger.setPrice(350.0);
            classicBurger.setCategory("Бургеры");
            classicBurger.setAvailable(true);
            classicBurger.setImageUrl("/images/classic-burger.jpg");
            menuItemRepository.save(classicBurger);

            MenuItem cheeseburger = new MenuItem();
            cheeseburger.setName("Чизбургер");
            cheeseburger.setDescription("Говяжья котлета, плавленый сыр, маринованные огурцы, лук, кетчуп");
            cheeseburger.setPrice(380.0);
            cheeseburger.setCategory("Бургеры");
            cheeseburger.setAvailable(true);
            cheeseburger.setImageUrl("/images/cheeseburger.jpg");
            menuItemRepository.save(cheeseburger);

            MenuItem doubleBurger = new MenuItem();
            doubleBurger.setName("Двойной бургер");
            doubleBurger.setDescription("Две говяжьи котлеты, двойной сыр, бекон, специальный соус");
            doubleBurger.setPrice(550.0);
            doubleBurger.setCategory("Бургеры");
            doubleBurger.setAvailable(true);
            doubleBurger.setImageUrl("/images/double-burger.jpg");
            menuItemRepository.save(doubleBurger);

            // Напитки
            MenuItem cola = new MenuItem();
            cola.setName("Кока-Кола");
            cola.setDescription("Классический газированный напиток");
            cola.setPrice(150.0);
            cola.setCategory("Напитки");
            cola.setAvailable(true);
            cola.setImageUrl("/images/cola.jpg");
            menuItemRepository.save(cola);

            MenuItem sprite = new MenuItem();
            sprite.setName("Спрайт");
            sprite.setDescription("Освежающий лимонно-лаймовый напиток");
            sprite.setPrice(150.0);
            sprite.setCategory("Напитки");
            sprite.setAvailable(true);
            sprite.setImageUrl("/images/sprite.jpg");
            menuItemRepository.save(sprite);

            // Сайды
            MenuItem fries = new MenuItem();
            fries.setName("Картофель фри");
            fries.setDescription("Хрустящий картофель фри с солью");
            fries.setPrice(200.0);
            fries.setCategory("Сайды");
            fries.setAvailable(true);
            fries.setImageUrl("/images/fries.jpg");
            menuItemRepository.save(fries);

            MenuItem nuggets = new MenuItem();
            nuggets.setName("Наггетсы");
            nuggets.setDescription("Куриные наггетсы с соусом на выбор");
            nuggets.setPrice(250.0);
            nuggets.setCategory("Сайды");
            nuggets.setAvailable(true);
            nuggets.setImageUrl("/images/nuggets.jpg");
            menuItemRepository.save(nuggets);

            // Создание админа, если его нет
            System.out.println("Checking for admin account...");
            if (userRepository.findByUsername("admin").isEmpty()) {
                System.out.println("Admin account not found, creating new one...");
                User admin = new User();
                admin.setUsername("admin");
                String rawPassword = "111";
                String encodedPassword = passwordEncoder.encode(rawPassword);
                System.out.println("Raw password: " + rawPassword);
                System.out.println("Encoded password: " + encodedPassword);
                admin.setPassword(encodedPassword);
                admin.setEmail("admin@burger.com");
                admin.setFullName("System Administrator");
                admin.setPhoneNumber("+7 (999) 999-99-99");
                admin.setAddress("System Address");
                admin.setRoles(new HashSet<>(List.of("ROLE_ADMIN")));
                admin.setEnabled(true);
                User savedAdmin = userRepository.save(admin);
                System.out.println("Admin account created successfully! ID: " + savedAdmin.getId());
            } else {
                System.out.println("Admin account already exists!");
            }
        };
    }
} 