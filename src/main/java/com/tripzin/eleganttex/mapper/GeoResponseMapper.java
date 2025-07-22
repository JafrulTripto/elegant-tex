package com.tripzin.eleganttex.mapper;

import com.tripzin.eleganttex.dto.response.*;
import com.tripzin.eleganttex.entity.*;

import java.util.List;
import java.util.stream.Collectors;

public class GeoResponseMapper {

    public static UpazilaResponse toUpazilaResponse(Upazila upazila) {
        return new UpazilaResponse(
            upazila.getId(),
            upazila.getName(),
            upazila.getBnName(),
            upazila.getUrl()
        );
    }

    public static DistrictResponse toDistrictResponse(District district) {
        List<UpazilaResponse> upazilas = district.getUpazilas()
            .stream()
            .map(GeoResponseMapper::toUpazilaResponse)
            .collect(Collectors.toList());

        return new DistrictResponse(
            district.getId(),
            district.getName(),
            district.getBnName(),
            district.getUrl(),
            upazilas
        );
    }

    public static DivisionResponse toDivisionResponse(Division division) {
        List<DistrictResponse> districts = division.getDistricts()
            .stream()
            .map(GeoResponseMapper::toDistrictResponse)
            .collect(Collectors.toList());

        return new DivisionResponse(
            division.getId(),
            division.getName(),
            division.getBnName(),
            division.getUrl(),
            districts
        );
    }
}
