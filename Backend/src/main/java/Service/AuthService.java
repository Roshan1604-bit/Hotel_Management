
package com.example.Hotel_Management.Service;

import com.example.Hotel_Management.Model.User;
import com.example.Hotel_Management.Repo.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepo userRepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // REGISTER
    public User register(User user) {

        if (user.getName() == null
                || user.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name is required");
        }

        if (user.getEmail() == null
                || user.getEmail().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required");
        }

        if (user.getPassword() == null
                || user.getPassword().length() < 8) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must contain at least 8 characters");
        }

        String email = user.getEmail()
                .trim()
                .toLowerCase();

        if (userRepo.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered");
        }

        user.setId(null);
        user.setEmail(email);

        // Hash the password before saving.
        user.setPassword(
                passwordEncoder.encode(user.getPassword()));

        return userRepo.save(user);
    }

    // LOGIN
    public Map<String, String> login(
            String email, String password) {

        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email and password are required");
        }

        User user = userRepo.findByEmail(
                email.trim().toLowerCase()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"));

        if (!passwordEncoder.matches(
                password, user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password");
        }

        String token =
                jwtService.generateToken(user.getEmail());

        return Map.of(
                "message", "Login successful",
                "tokenType", "Bearer",
                "token", token,
                "name", user.getName(),
                "email", user.getEmail()
        );
    }
}
