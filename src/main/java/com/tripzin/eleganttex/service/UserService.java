package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.UserDTO;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.Role;
import com.tripzin.eleganttex.entity.User;
import com.tripzin.eleganttex.exception.BadRequestException;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.RoleRepository;
import com.tripzin.eleganttex.repository.UserRepository;
import com.tripzin.eleganttex.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
        
        // Update account verification status
        user.setAccountVerified(userDTO.isAccountVerified());
        
        // Update roles if provided
        if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            
            userDTO.getRoles().forEach(roleName -> {
                // Ensure role name has ROLE_ prefix
                String formattedRoleName = roleName.startsWith("ROLE_") ? 
                    roleName : "ROLE_" + roleName.toUpperCase();
                
                Role role = roleRepository.findByName(formattedRoleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                roles.add(role);
            });
            
            user.setRoles(roles);
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
            // Ensure role name has ROLE_ prefix
            String formattedRoleName = roleName.startsWith("ROLE_") ? 
                roleName : "ROLE_" + roleName.toUpperCase();
            
            Role role = roleRepository.findByName(formattedRoleName)
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
            roles.add(role);
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
    
    public Page<UserDTO> searchUsers(
            String search,
            Boolean emailVerified,
            Boolean accountVerified,
            List<String> roles,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        
        // Create pageable
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Search users without role filtering
        Page<User> userPage = userRepository.searchUsers(search, emailVerified, accountVerified, pageable);
        
        // If roles filter is provided, filter the results in memory
        if (roles != null && !roles.isEmpty()) {
            // Format role names to ensure ROLE_ prefix
            Set<String> formattedRoleNames = roles.stream()
                    .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase())
                    .collect(Collectors.toSet());
            
            // Filter users by roles
            List<User> filteredUsers = userPage.getContent().stream()
                    .filter(user -> {
                        // Check if user has any of the specified roles
                        return user.getRoles().stream()
                                .anyMatch(role -> formattedRoleNames.contains(role.getName()));
                    })
                    .collect(Collectors.toList());
            
            // Create a new page with filtered users
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filteredUsers.size());
            
            // Handle case where start might be out of bounds
            if (start >= filteredUsers.size()) {
                List<UserDTO> emptyDtoList = new ArrayList<>();
                return new PageImpl<>(emptyDtoList, pageable, filteredUsers.size());
            }
            
            List<User> pageContent = filteredUsers.subList(start, end);
            Page<User> filteredPage = new PageImpl<>(pageContent, pageable, filteredUsers.size());
            
            // Convert to DTOs
            return filteredPage.map(UserDTO::fromEntity);
        }
        
        // Convert to DTOs
        return userPage.map(UserDTO::fromEntity);
    }
}
