import api from './api';
import { Fabric, FabricFormData } from '../types/fabric';

const BASE_URL = '/fabrics';

export const getFabrics = async (
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

export const getFabricById = async (id: number) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data as Fabric;
};

export const createFabric = async (fabricData: FabricFormData) => {
  const response = await api.post(BASE_URL, fabricData);
  return response.data as Fabric;
};

export const updateFabric = async (id: number, fabricData: FabricFormData) => {
  const response = await api.put(`${BASE_URL}/${id}`, fabricData);
  return response.data as Fabric;
};

export const deleteFabric = async (id: number) => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};

export const uploadFabricImage = async (fabricId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`${BASE_URL}/${fabricId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data as Fabric;
};

const fabricService = {
  getFabrics,
  getFabricById,
  createFabric,
  updateFabric,
  deleteFabric,
  uploadFabricImage,
};

export default fabricService;
