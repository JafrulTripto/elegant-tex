package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.entity.StyleCode;

import java.util.List;

public interface StyleCodeService {
    
    List<StyleCode> getAllStyleCodes();
    
    List<StyleCode> getActiveStyleCodes();
    
    StyleCode getStyleCodeById(Long id);
    
    StyleCode getStyleCodeByCode(String code);
    
    StyleCode createStyleCode(StyleCode styleCode);
    
    StyleCode updateStyleCode(Long id, StyleCode styleCode);
    
    void deleteStyleCode(Long id);
    
    StyleCode toggleStyleCodeActive(Long id);
    
    boolean existsByCode(String code);
}
