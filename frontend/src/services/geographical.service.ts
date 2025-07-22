import api from './api';
import { Division, District, Upazila, GeographicalOption } from '../types/geographical';

export const geographicalService = {
  // Division services
  async getAllDivisions(): Promise<Division[]> {
    const response = await api.get('/geographical/divisions');
    return response.data;
  },

  async getDivisionById(id: number): Promise<Division> {
    const response = await api.get(`/geographical/divisions/${id}`);
    return response.data;
  },

  // District services
  async getAllDistricts(): Promise<District[]> {
    const response = await api.get('/geographical/districts');
    return response.data;
  },

  async getDistrictById(id: number): Promise<District> {
    const response = await api.get(`/geographical/districts/${id}`);
    return response.data;
  },

  async getDistrictsByDivision(divisionId: number): Promise<District[]> {
    const response = await api.get(`/geographical/divisions/${divisionId}/districts`);
    return response.data;
  },

  // Upazila services
  async getAllUpazilas(): Promise<Upazila[]> {
    const response = await api.get('/geographical/upazilas');
    return response.data;
  },

  async getUpazilaById(id: number): Promise<Upazila> {
    const response = await api.get(`/geographical/upazilas/${id}`);
    return response.data;
  },

  async getUpazilasByDistrict(districtId: number): Promise<Upazila[]> {
    const response = await api.get(`/geographical/districts/${districtId}/upazilas`);
    return response.data;
  },

  async getUpazilasByDivision(divisionId: number): Promise<Upazila[]> {
    const response = await api.get(`/geographical/divisions/${divisionId}/upazilas`);
    return response.data;
  },

  // Helper methods for form options
  async getDivisionOptions(): Promise<GeographicalOption[]> {
    const divisions = await this.getAllDivisions();
    return divisions.map(division => ({
      value: division.id,
      label: division.name,
      bnLabel: division.bnName
    }));
  },

  async getDistrictOptions(divisionId: number): Promise<GeographicalOption[]> {
    const districts = await this.getDistrictsByDivision(divisionId);
    return districts.map(district => ({
      value: district.id,
      label: district.name,
      bnLabel: district.bnName
    }));
  },

  async getUpazilaOptions(districtId: number): Promise<GeographicalOption[]> {
    const upazilas = await this.getUpazilasByDistrict(districtId);
    return upazilas.map(upazila => ({
      value: upazila.id,
      label: upazila.name,
      bnLabel: upazila.bnName
    }));
  }
};
