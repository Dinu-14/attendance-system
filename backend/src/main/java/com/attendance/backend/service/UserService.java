package com.attendance.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.attendance.backend.model.User;
import com.attendance.backend.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public boolean authenticate(String username, String password) {
        Optional<User> user = userRepository.findByUsername(username);
        // For production, use passwordEncoder.matches. For now, support both hashed and plain text passwords.
        return user.isPresent() && (password.equals(user.get().getPassword()) || passwordEncoder.matches(password, user.get().getPassword()));
    }
}
