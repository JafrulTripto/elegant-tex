package com.tripzin.eleganttex.dto.response;

import java.util.List;

public record DivisionResponse(
    Long id,
    String name,
    String bnName,
    String url,
    List<DistrictResponse> districts
) {}