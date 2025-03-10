package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.FileStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileStorageRepository extends JpaRepository<FileStorage, Long> {
    
    List<FileStorage> findByEntityTypeAndEntityId(String entityType, Long entityId);
    
    Optional<FileStorage> findByFileNameAndEntityTypeAndEntityId(String fileName, String entityType, Long entityId);
    
    void deleteByEntityTypeAndEntityId(String entityType, Long entityId);
}
