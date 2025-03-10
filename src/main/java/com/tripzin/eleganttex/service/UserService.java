package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.UserDTO;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.ERole;
import com.tripzin.eleganttex.entity.Role;
import com.tripzin.eleganttex.entity.User;
import com.tripzin.eleganttex.exception.BadRequestException;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.RoleRepository;
import com.tripzin.eleganttex.repository.UserRepository;
import com.tripzin.eleganttex.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserDTO.fromEntity(user);
    }
    
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserDTO.fromEntity(user);
    }
    
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Update basic info
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        
        // Check if email is being changed
        if (!user.getEmail().equals(userDTO.getEmail())) {
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new BadRequestException("Email is already in use");
            }
            user.setEmail(userDTO.getEmail());
            user.setEmailVerified(false);
            // TODO: Send verification email for new email
        }
        
        // Check if phone is being changed
        if (!user.getPhone().equals(userDTO.getPhone())) {
            if (userRepository.existsByPhone(userDTO.getPhone())) {
                throw new BadRequestException("Phone number is already in use");
            }
            user.setPhone(userDTO.getPhone());
        }
        
        // Update password if provided
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        
        // Update profile image ID if provided
        if (userDTO.getProfileImageId() != null) {
            user.setProfileImageId(userDTO.getProfileImageId());
        }
        
        User updatedUser = userRepository.save(user);
        return UserDTO.fromEntity(updatedUser);
    }
    
    @Transactional
    public MessageResponse deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Delete verification tokens
        tokenRepository.deleteByUser(user);
        
        // Delete user
        userRepository.delete(user);
        
        return MessageResponse.success("User deleted successfully");
    }
    
    @Transactional
    public UserDTO assignRolesToUser(Long userId, Set<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Set<Role> roles = new HashSet<>();
        
        roleNames.forEach(roleName -> {
            try {
                ERole eRole = ERole.valueOf("ROLE_" + roleName.toUpperCase());
                Role role = roleRepository.findByName(eRole)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                roles.add(role);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role name: " + roleName);
            }
        });
        
        user.setRoles(roles);
        User updatedUser = userRepository.save(user);
        
        return UserDTO.fromEntity(updatedUser);
    }
    
    @Transactional
    public MessageResponse verifyAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        user.setAccountVerified(true);
        userRepository.save(user);
        
        return MessageResponse.success("User account verified successfully");
    }
}
