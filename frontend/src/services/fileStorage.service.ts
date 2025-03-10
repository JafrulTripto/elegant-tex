import api from './api';
import { API_BASE_URL } from '../config/env';

const BASE_URL = '/files';

export interface FileStorage {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  entityType: string;
  entityId: number;
  createdAt: string;
  updatedAt: string;
}

export const uploadFile = async (file: File, entityType: string, entityId: number) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('entityId', entityId.toString());
  
  const response = await api.post(`${BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data as FileStorage;
};

export const getFile = async (id: number) => {
  try {
    // This returns a blob that can be used to create an object URL
    const response = await api.get(`${BASE_URL}/${id}`, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
};

export const getFileUrl = (id?: number | null) => {
  if (!id) return null;
  return `${API_BASE_URL}${BASE_URL}/${id}`;
};

// Alternative URL for direct access to uploaded files
export const getDirectFileUrl = (fileName: string) => {
  // Use the API_BASE_URL directly to avoid any issues with api.defaults.baseURL
  return `${API_BASE_URL}/uploads/${fileName}`;
};

export const getFilesByEntity = async (entityType: string, entityId: number) => {
  const response = await api.get(`${BASE_URL}/entity/${entityType}/${entityId}`);
  return response.data as FileStorage[];
};

export const deleteFile = async (id: number) => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};

export const deleteFilesByEntity = async (entityType: string, entityId: number) => {
  const response = await api.delete(`${BASE_URL}/entity/${entityType}/${entityId}`);
  return response.data;
};

const fileStorageService = {
  uploadFile,
  getFile,
  getFileUrl,
  getFilesByEntity,
  deleteFile,
  deleteFilesByEntity,
};

export default fileStorageService;
