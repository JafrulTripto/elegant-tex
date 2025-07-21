package com.tripzin.eleganttex.dto.response;

import java.util.List;

public record DistrictResponse(
    Long id,
    String name,
    String bnName,
    String url,
    List<UpazilaResponse> upazilas
) {}