package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.dto.response.DivisionResponse;
import com.tripzin.eleganttex.dto.response.DistrictResponse;
import com.tripzin.eleganttex.dto.response.UpazilaResponse;
import com.tripzin.eleganttex.entity.Division;
import com.tripzin.eleganttex.entity.District;
import com.tripzin.eleganttex.entity.Upazila;
import com.tripzin.eleganttex.mapper.GeoResponseMapper;
import com.tripzin.eleganttex.repository.DivisionRepository;
import com.tripzin.eleganttex.repository.DistrictRepository;
import com.tripzin.eleganttex.repository.UpazilaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/geographical")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class GeographicalController {

    private final DivisionRepository divisionRepository;
    private final DistrictRepository districtRepository;
    private final UpazilaRepository upazilaRepository;

    @GetMapping("/divisions")
    public ResponseEntity<List<DivisionResponse>> getAllDivisions() {
        log.info("Getting all divisions");
        List<Division> divisions = divisionRepository.findAllOrderByName();
        List<DivisionResponse> response = divisions.stream()
                .map(GeoResponseMapper::toDivisionResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/divisions/{id}")
    public ResponseEntity<DivisionResponse> getDivisionById(@PathVariable Long id) {
        log.info("Getting division by ID: {}", id);
        return divisionRepository.findById(id)
                .map(GeoResponseMapper::toDivisionResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/divisions/{divisionId}/districts")
    public ResponseEntity<List<DistrictResponse>> getDistrictsByDivision(@PathVariable Long divisionId) {
        log.info("Getting districts for division ID: {}", divisionId);
        List<District> districts = districtRepository.findByDivisionIdOrderByName(divisionId);
        List<DistrictResponse> response = districts.stream()
                .map(GeoResponseMapper::toDistrictResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/districts")
    public ResponseEntity<List<DistrictResponse>> getAllDistricts() {
        log.info("Getting all districts");
        List<District> districts = districtRepository.findAllOrderByName();
        List<DistrictResponse> response = districts.stream()
                .map(GeoResponseMapper::toDistrictResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/districts/{id}")
    public ResponseEntity<DistrictResponse> getDistrictById(@PathVariable Long id) {
        log.info("Getting district by ID: {}", id);
        return districtRepository.findById(id)
                .map(GeoResponseMapper::toDistrictResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/districts/{districtId}/upazilas")
    public ResponseEntity<List<UpazilaResponse>> getUpazilasByDistrict(@PathVariable Long districtId) {
        log.info("Getting upazilas for district ID: {}", districtId);
        List<Upazila> upazilas = upazilaRepository.findByDistrictIdOrderByName(districtId);
        List<UpazilaResponse> response = upazilas.stream()
                .map(GeoResponseMapper::toUpazilaResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/upazilas")
    public ResponseEntity<List<UpazilaResponse>> getAllUpazilas() {
        log.info("Getting all upazilas");
        List<Upazila> upazilas = upazilaRepository.findAllOrderByName();
        List<UpazilaResponse> response = upazilas.stream()
                .map(GeoResponseMapper::toUpazilaResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/upazilas/{id}")
    public ResponseEntity<UpazilaResponse> getUpazilaById(@PathVariable Long id) {
        log.info("Getting upazila by ID: {}", id);
        return upazilaRepository.findById(id)
                .map(GeoResponseMapper::toUpazilaResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/divisions/{divisionId}/upazilas")
    public ResponseEntity<List<UpazilaResponse>> getUpazilasByDivision(@PathVariable Long divisionId) {
        log.info("Getting upazilas for division ID: {}", divisionId);
        List<Upazila> upazilas = upazilaRepository.findByDivisionIdOrderByName(divisionId);
        List<UpazilaResponse> response = upazilas.stream()
                .map(GeoResponseMapper::toUpazilaResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
