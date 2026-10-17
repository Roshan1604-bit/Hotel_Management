
package com.example.Hotel_Management.Controller;
import java.util.HashMap;
import com.example.Hotel_Management.Model.User;
import com.example.Hotel_Management.Service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.Hotel_Management.Model.Login;
import java.util.Map;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        User savedUser = authService.register(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "Registration successful",
                        "id", savedUser.getId(),
                        "name", savedUser.getName(),
                        "email", savedUser.getEmail()
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Login request) {

        Map<String, String> result = authService.login(
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(result);
    }
    }


