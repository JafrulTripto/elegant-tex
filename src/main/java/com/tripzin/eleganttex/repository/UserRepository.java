package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByPhone(String phone);
    
    Boolean existsByEmail(String email);
    
    Boolean existsByPhone(String phone);
}
