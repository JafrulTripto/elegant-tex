package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByPhone(String phone);
    
    Boolean existsByEmail(String email);
    
    Boolean existsByPhone(String phone);
    
    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.phone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:emailVerified IS NULL OR u.emailVerified = :emailVerified) " +
           "AND (:accountVerified IS NULL OR u.accountVerified = :accountVerified)")
    Page<User> searchUsers(
        @Param("search") String search,
        @Param("emailVerified") Boolean emailVerified,
        @Param("accountVerified") Boolean accountVerified,
        Pageable pageable);
}
