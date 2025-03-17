import api from './api';
import { ProductType, ProductTypeFormData } from '../types/productType';

const BASE_URL = '/product-types';

export const getAllProductTypes = async (): Promise<ProductType[]> => {
  const response = await api.get(BASE_URL);
  return response.data;
};

export const getActiveProductTypes = async (): Promise<ProductType[]> => {
  const response = await api.get(`${BASE_URL}/active`);
  return response.data;
};

export const getProductTypeById = async (id: number): Promise<ProductType> => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const createProductType = async (productType: ProductTypeFormData): Promise<ProductType> => {
  const response = await api.post(BASE_URL, productType);
  return response.data;
};

export const updateProductType = async (id: number, productType: ProductTypeFormData): Promise<ProductType> => {
  const response = await api.put(`${BASE_URL}/${id}`, productType);
  return response.data;
};

export const deleteProductType = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

export const toggleProductTypeActive = async (id: number): Promise<ProductType> => {
  const response = await api.patch(`${BASE_URL}/${id}/toggle-active`);
  return response.data;
};
