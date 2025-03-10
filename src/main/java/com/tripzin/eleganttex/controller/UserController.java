package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.UserDTO;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.FileStorage;
import com.tripzin.eleganttex.security.services.UserDetailsImpl;
import com.tripzin.eleganttex.service.FileStorageService;
import com.tripzin.eleganttex.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final FileStorageService fileStorageService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id, authentication)")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id, authentication)")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id, authentication)")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }
    
    @PostMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> assignRolesToUser(@PathVariable Long id, @RequestBody Set<String> roles) {
        return ResponseEntity.ok(userService.assignRolesToUser(id, roles));
    }
    
    @PostMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> verifyUserAccount(@PathVariable Long id) {
        return ResponseEntity.ok(userService.verifyAccount(id));
    }
    
    @PostMapping(value = "/{id}/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id, authentication)")
    public ResponseEntity<UserDTO> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        // Get the user
        UserDTO user = userService.getUserById(id);
        
        // Delete old image if exists
        if (user.getProfileImageId() != null) {
            fileStorageService.deleteFile(user.getProfileImageId());
        }
        
        // Store new image
        FileStorage storedFile = fileStorageService.storeFile(file, "USER", id);
        
        // Update user with new profile image ID
        user.setProfileImageId(storedFile.getId());
        UserDTO updatedUser = userService.updateUser(id, user);
        
        return ResponseEntity.ok(updatedUser);
    }
}
