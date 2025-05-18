package org.example.server.controller;

import org.example.server.model.User;
import org.example.server.service.UserService;
import org.example.server.dto.UserDTO;
import org.example.server.mapper.UserMapper;
import org.example.server.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UserService userService, UserMapper userMapper, 
                         AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("Attempting login for user: " + loginRequest.getUsername());
        try {
            System.out.println("Creating authentication token...");
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword());
            System.out.println("Attempting authentication...");
            Authentication authentication = authenticationManager.authenticate(authToken);
            
            System.out.println("Authentication successful, setting security context...");
            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = (User) authentication.getPrincipal();
            System.out.println("Login successful for user: " + user.getUsername() + " with roles: " + user.getRoles());
            
            String token = jwtTokenProvider.generateToken(user);
            System.out.println("Generated JWT token: " + token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userMapper.toDTO(user));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Login failed for user: " + loginRequest.getUsername() + ". Error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed");
            errorResponse.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO userDTO) {
        User user = userMapper.toEntity(userDTO);
        User saved = userService.registerUser(user);
        String token = jwtTokenProvider.generateToken(saved);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userMapper.toDTO(saved));
        
        return ResponseEntity.ok(response);
    }
}

class LoginRequest {
    private String username;
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
} 