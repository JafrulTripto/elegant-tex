package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.response.TagDTO;
import com.tripzin.eleganttex.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class TagController {
    
    private final TagService tagService;
    
    @GetMapping("/search")
    public ResponseEntity<List<TagDTO>> searchTags(@RequestParam String query) {
        List<TagDTO> tags = tagService.searchTags(query);
        return ResponseEntity.ok(tags);
    }
    
    @PostMapping
    public ResponseEntity<TagDTO> createTag(@Valid @RequestBody Map<String, String> request) {
        String name = request.get("name");
        TagDTO createdTag = tagService.createTag(name);
        return ResponseEntity.ok(createdTag);
    }
}
