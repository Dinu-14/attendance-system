package com.attendance.backend.controller;

import com.attendance.backend.model.User;
import com.attendance.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LoginController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        userService.register(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        boolean authenticated = userService.authenticate(user.getUsername(), user.getPassword());
        return authenticated ? ResponseEntity.ok("Login successful") : ResponseEntity.status(401).body("Invalid credentials");
    }

    // 🔧 Temporary test endpoint
    @GetMapping("/ping")
    public String ping() {
        return "Controller is working!";
    }
}
