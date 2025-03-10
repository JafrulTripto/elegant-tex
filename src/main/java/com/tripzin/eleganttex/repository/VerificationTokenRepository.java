package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.User;
import com.tripzin.eleganttex.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    
    Optional<VerificationToken> findByToken(String token);
    
    List<VerificationToken> findByUser(User user);
    
    List<VerificationToken> findByUserAndTokenType(User user, VerificationToken.TokenType tokenType);
    
    void deleteByUser(User user);
}
