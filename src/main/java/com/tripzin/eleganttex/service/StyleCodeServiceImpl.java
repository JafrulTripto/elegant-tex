package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.entity.StyleCode;
import com.tripzin.eleganttex.exception.BadRequestException;
import com.tripzin.eleganttex.exception.AppException;
import com.tripzin.eleganttex.repository.StyleCodeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StyleCodeServiceImpl implements StyleCodeService {

    private final StyleCodeRepository styleCodeRepository;

    @Autowired
    public StyleCodeServiceImpl(StyleCodeRepository styleCodeRepository) {
        this.styleCodeRepository = styleCodeRepository;
    }

    @Override
    public List<StyleCode> getAllStyleCodes() {
        return styleCodeRepository.findAll(Sort.by(Sort.Direction.ASC, "code"));
    }

    @Override
    public List<StyleCode> getActiveStyleCodes() {
        return styleCodeRepository.findByActive(true);
    }

    @Override
    public StyleCode getStyleCodeById(Long id) {
        return styleCodeRepository.findById(id)
                .orElseThrow(() -> new AppException("Style code not found with id: " + id, HttpStatus.NOT_FOUND));
    }

    @Override
    public StyleCode getStyleCodeByCode(String code) {
        return styleCodeRepository.findByCode(code)
                .orElseThrow(() -> new AppException("Style code not found with code: " + code, HttpStatus.NOT_FOUND));
    }

    @Override
    @Transactional
    public StyleCode createStyleCode(StyleCode styleCode) {
        // Check if style code with the same code already exists
        if (styleCodeRepository.existsByCode(styleCode.getCode())) {
            throw new BadRequestException("Style code with code '" + styleCode.getCode() + "' already exists");
        }
        
        // Set active to true by default if not specified
        if (styleCode.getActive() == null) {
            styleCode.setActive(true);
        }
        
        return styleCodeRepository.save(styleCode);
    }

    @Override
    @Transactional
    public StyleCode updateStyleCode(Long id, StyleCode styleCodeDetails) {
        StyleCode styleCode = getStyleCodeById(id);
        
        // Check if another style code with the same code already exists
        if (!styleCode.getCode().equals(styleCodeDetails.getCode()) && 
            styleCodeRepository.existsByCode(styleCodeDetails.getCode())) {
            throw new BadRequestException("Style code with code '" + styleCodeDetails.getCode() + "' already exists");
        }
        
        styleCode.setCode(styleCodeDetails.getCode());
        styleCode.setName(styleCodeDetails.getName());
        
        if (styleCodeDetails.getActive() != null) {
            styleCode.setActive(styleCodeDetails.getActive());
        }
        
        return styleCodeRepository.save(styleCode);
    }

    @Override
    @Transactional
    public void deleteStyleCode(Long id) {
        StyleCode styleCode = getStyleCodeById(id);
        styleCodeRepository.delete(styleCode);
    }

    @Override
    @Transactional
    public StyleCode toggleStyleCodeActive(Long id) {
        StyleCode styleCode = getStyleCodeById(id);
        styleCode.setActive(!styleCode.getActive());
        return styleCodeRepository.save(styleCode);
    }

    @Override
    public boolean existsByCode(String code) {
        return styleCodeRepository.existsByCode(code);
    }
}
