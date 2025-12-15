package com.tripzin.eleganttex.service.impl;

import com.tripzin.eleganttex.dto.response.StoreItemResponse;
import com.tripzin.eleganttex.entity.StoreItem;
import com.tripzin.eleganttex.entity.StoreItemQuality;
import com.tripzin.eleganttex.entity.StoreItemSource;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.StoreItemRepository;
import com.tripzin.eleganttex.service.StoreItemService;
import com.tripzin.eleganttex.service.mapper.StoreMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreItemServiceImpl implements StoreItemService {

    private final StoreItemRepository storeItemRepository;
    private final StoreMapper storeMapper;

    @Override
    public Page<StoreItemResponse> getAllItems(Pageable pageable) {
        return storeItemRepository.findAll(pageable).map(storeMapper::toResponse);
    }

    @Override
    public StoreItemResponse getItemById(Long id) {
        StoreItem item = storeItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store item not found with ID: " + id));
        return storeMapper.toResponse(item);
    }

    @Override
    public StoreItemResponse getItemBySku(String sku) {
        StoreItem item = storeItemRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Store item not found with SKU: " + sku));
        return storeMapper.toResponse(item);
    }

    @Override
    public Page<StoreItemResponse> searchItems(Long fabricId,
                                               Long productTypeId,
                                               StoreItemQuality quality,
                                               StoreItemSource sourceType,
                                               String sku,
                                               Boolean onlyWithStock,
                                               Pageable pageable) {
        Specification<StoreItem> spec = (root, query, cb) -> {
            var predicates = new ArrayList<Predicate>();
            if (fabricId != null) {
                predicates.add(cb.equal(root.get("fabric").get("id"), fabricId));
            }
            if (productTypeId != null) {
                predicates.add(cb.equal(root.get("productType").get("id"), productTypeId));
            }
            if (quality != null) {
                predicates.add(cb.equal(root.get("quality"), quality));
            }
            if (sourceType != null) {
                predicates.add(cb.equal(root.get("sourceType"), sourceType));
            }
            if (sku != null && !sku.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("sku")), "%" + sku.toLowerCase() + "%"));
            }
            if (Boolean.TRUE.equals(onlyWithStock)) {
                predicates.add(cb.greaterThan(root.get("quantity"), 0));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return storeItemRepository.findAll(spec, pageable).map(storeMapper::toResponse);
    }

    @Override
    public Page<StoreItemResponse> getItemsByOrderNumber(String orderNumber, Pageable pageable) {
        return storeItemRepository.findBySourceOrderNumber(orderNumber).stream()
                .map(storeMapper::toResponse)
                .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toList(),
                        list -> new org.springframework.data.domain.PageImpl<>(list, pageable, list.size())
                ));
    }

    @Override
    public void deleteItem(Long id, Long userId) {
        // Soft-delete is not implemented; proceed with hard delete of item and its images/transactions via cascade
        if (!storeItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Store item not found with ID: " + id);
        }
        storeItemRepository.deleteById(id);
        log.info("Deleted store item {} by user {}", id, userId);
    }
}
