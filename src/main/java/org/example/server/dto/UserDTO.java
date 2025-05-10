package org.example.server.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UserDTO {
    private String id;
    private String username;
    private String email;
    private String address;
    private Set<String> roles;
    private boolean enabled;
} 