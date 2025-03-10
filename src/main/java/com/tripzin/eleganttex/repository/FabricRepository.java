package com.tripzin.eleganttex.repository;

import com.tripzin.eleganttex.entity.Fabric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FabricRepository extends JpaRepository<Fabric, Long> {
    @NonNull
    Page<Fabric> findAll(@NonNull Pageable pageable);
    List<Fabric> findByTagsId(Long tagId);
    boolean existsByImageId(Long imageId);
}
