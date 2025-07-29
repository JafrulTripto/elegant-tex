package com.tripzin.eleganttex.mapper;

import com.tripzin.eleganttex.dto.response.AddressResponse;
import com.tripzin.eleganttex.entity.Address;

public class AddressResponseMapper {
    /**
     * Maps an Address entity to an AddressResponse DTO
     */
    public static AddressResponse mapToAddressResponse(Address address) {
        if (address == null) {
            return null;
        }
        
        return AddressResponse.builder()
                .id(address.getId())
                .divisionId(address.getDivision() != null ? address.getDivision().getId() : null)
                .districtId(address.getDistrict() != null ? address.getDistrict().getId() : null)
                .upazilaId(address.getUpazila() != null ? address.getUpazila().getId() : null)
                .addressLine(address.getAddressLine())
                .postalCode(address.getPostalCode())
                .formattedAddress(address.getFormattedAddress())
                .build();
    }
}
