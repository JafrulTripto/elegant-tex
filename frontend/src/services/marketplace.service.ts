import api from './api';
import { Marketplace, MarketplaceFormData } from '../types/marketplace';

const BASE_URL = '/marketplaces';

export const getMarketplaces = async (
  page = 0,
  size = 10,
  sortBy = 'id',
  sortDir = 'asc'
) => {
  const response = await api.get(
    `${BASE_URL}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
  );
  return response.data;
};

export const getMarketplaceById = async (id: number) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data as Marketplace;
};

export const getUserMarketplaces = async (userId: number) => {
  const response = await api.get(`${BASE_URL}/user/${userId}`);
  return response.data as Marketplace[];
};

export const createMarketplace = async (marketplaceData: MarketplaceFormData) => {
  const response = await api.post(BASE_URL, marketplaceData);
  return response.data as Marketplace;
};

export const updateMarketplace = async (id: number, marketplaceData: MarketplaceFormData) => {
  const response = await api.put(`${BASE_URL}/${id}`, marketplaceData);
  return response.data as Marketplace;
};

export const deleteMarketplace = async (id: number) => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};

export const addMember = async (marketplaceId: number, userId: number) => {
  const response = await api.post(`${BASE_URL}/${marketplaceId}/members/${userId}`);
  return response.data as Marketplace;
};

export const removeMember = async (marketplaceId: number, userId: number) => {
  const response = await api.delete(`${BASE_URL}/${marketplaceId}/members/${userId}`);
  return response.data as Marketplace;
};

export const uploadMarketplaceImage = async (marketplaceId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`${BASE_URL}/${marketplaceId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data as Marketplace;
};

const marketplaceService = {
  getMarketplaces,
  getMarketplaceById,
  getUserMarketplaces,
  createMarketplace,
  updateMarketplace,
  deleteMarketplace,
  addMember,
  removeMember,
  uploadMarketplaceImage,
};

export default marketplaceService;
