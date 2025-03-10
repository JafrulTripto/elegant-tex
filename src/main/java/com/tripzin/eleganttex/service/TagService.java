package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.dto.response.TagDTO;
import com.tripzin.eleganttex.entity.Tag;
import com.tripzin.eleganttex.exception.BadRequestException;
import com.tripzin.eleganttex.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TagService {
    
    private final TagRepository tagRepository;
    
    public List<TagDTO> searchTags(String query) {
        return tagRepository.findByNameContainingIgnoreCase(query).stream()
                .map(TagDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TagDTO createTag(String name) {
        if (tagRepository.existsByName(name)) {
            throw new BadRequestException("Tag with this name already exists");
        }
        
        Tag tag = new Tag();
        tag.setName(name);
        Tag savedTag = tagRepository.save(tag);
        
        return TagDTO.fromEntity(savedTag);
    }
    
    @Transactional
    public Tag getOrCreateTag(String name) {
        return tagRepository.findByName(name)
                .orElseGet(() -> {
                    Tag newTag = new Tag();
                    newTag.setName(name);
                    return tagRepository.save(newTag);
                });
    }
}
