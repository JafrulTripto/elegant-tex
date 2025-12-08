package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.entity.StyleCode;
import com.tripzin.eleganttex.service.StyleCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/style-codes")
public class StyleCodeController {

    private final StyleCodeService styleCodeService;

    @Autowired
    public StyleCodeController(StyleCodeService styleCodeService) {
        this.styleCodeService = styleCodeService;
    }

    @GetMapping
    public ResponseEntity<List<StyleCode>> getAllStyleCodes() {
        return ResponseEntity.ok(styleCodeService.getAllStyleCodes());
    }

    @GetMapping("/active")
    public ResponseEntity<List<StyleCode>> getActiveStyleCodes() {
        return ResponseEntity.ok(styleCodeService.getActiveStyleCodes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StyleCode> getStyleCodeById(@PathVariable Long id) {
        return ResponseEntity.ok(styleCodeService.getStyleCodeById(id));
    }

    @PostMapping
    public ResponseEntity<StyleCode> createStyleCode(@Valid @RequestBody StyleCode styleCode) {
        StyleCode createdStyleCode = styleCodeService.createStyleCode(styleCode);
        return new ResponseEntity<>(createdStyleCode, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StyleCode> updateStyleCode(
            @PathVariable Long id,
            @Valid @RequestBody StyleCode styleCode) {
        return ResponseEntity.ok(styleCodeService.updateStyleCode(id, styleCode));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStyleCode(@PathVariable Long id) {
        styleCodeService.deleteStyleCode(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<StyleCode> toggleStyleCodeActive(@PathVariable Long id) {
        return ResponseEntity.ok(styleCodeService.toggleStyleCodeActive(id));
    }
}
