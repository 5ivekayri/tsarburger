package org.example.server.service;

import org.example.server.model.User;
import org.example.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Регистрация нового пользователя
    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setRoles(new java.util.HashSet<>());
            user.getRoles().add("ROLE_USER");
        }
        return userRepository.save(user);
    }

    // Получить пользователя по имени
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Получить пользователя по email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Получить пользователя по ID
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    // Получить всех пользователей
    public List<User> findAll() {
        return userRepository.findAll();
    }

    // Обновить данные пользователя
    public User updateUser(String id, User user) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        existingUser.setEmail(user.getEmail());
        existingUser.setAddress(user.getAddress());
        existingUser.setRoles(user.getRoles());
        existingUser.setEnabled(user.isEnabled());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        return userRepository.save(existingUser);
    }

    // Назначить пользователя администратором
    public User makeAdmin(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        user.getRoles().add("ROLE_ADMIN");
        return userRepository.save(user);
    }

    // Удалить пользователя
    public void deleteUser(String id) {
        System.out.println("Attempting to delete user with ID: " + id);
        if (!userRepository.existsById(id)) {
            System.out.println("User not found with ID: " + id);
            throw new RuntimeException("Пользователь не найден");
        }
        try {
            userRepository.deleteById(id);
            System.out.println("Successfully deleted user with ID: " + id);
        } catch (Exception e) {
            System.out.println("Error deleting user with ID: " + id + ". Error: " + e.getMessage());
            throw new RuntimeException("Ошибка при удалении пользователя: " + e.getMessage());
        }
    }
}