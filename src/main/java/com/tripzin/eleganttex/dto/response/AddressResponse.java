package com.tripzin.eleganttex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private Long id;
    private Long divisionId;
    private Long districtId;
    private Long upazilaId;
    private String addressLine;
    private String postalCode;
    private String formattedAddress;
}