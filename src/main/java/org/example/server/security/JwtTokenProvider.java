package org.example.server.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.example.server.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationInMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        logger.debug("Using JWT secret key length: {}", keyBytes.length);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        List<String> rolesWithPrefix = user.getRoles().stream()
            .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
            .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("userId", user.getId())
                .claim("roles", rolesWithPrefix)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();
        } catch (JwtException e) {
            logger.error("Error parsing JWT token: {}", e.getMessage());
            return null;
        }
    }

    public String getUserIdFromJWT(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("userId", String.class);
        } catch (JwtException e) {
            logger.error("Error parsing JWT token: {}", e.getMessage());
            return null;
        }
    }

    public List<String> getRolesFromJWT(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);
            return roles != null ? roles : new ArrayList<>();
        } catch (JwtException e) {
            logger.error("Error parsing JWT token roles: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public boolean validateToken(String authToken) {
        try {
            logger.debug("Validating token: {}", authToken);
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            logger.debug("Token validation successful");
            return true;
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature: {} for token: {}", ex.getMessage(), authToken);
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {} for token: {}", ex.getMessage(), authToken);
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {} for token: {}", ex.getMessage(), authToken);
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {} for token: {}", ex.getMessage(), authToken);
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty: {} for token: {}", ex.getMessage(), authToken);
        }
        return false;
    }
} 