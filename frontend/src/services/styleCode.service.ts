import api from './api';
import { StyleCode, StyleCodeFormData } from '../types/styleCode';

const BASE_URL = '/style-codes';

export const getAllStyleCodes = async (): Promise<StyleCode[]> => {
  const response = await api.get(BASE_URL);
  return response.data;
};

export const getActiveStyleCodes = async (): Promise<StyleCode[]> => {
  const response = await api.get(`${BASE_URL}/active`);
  return response.data;
};

export const getStyleCodeById = async (id: number): Promise<StyleCode> => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const createStyleCode = async (styleCode: StyleCodeFormData): Promise<StyleCode> => {
  const response = await api.post(BASE_URL, styleCode);
  return response.data;
};

export const updateStyleCode = async (id: number, styleCode: StyleCodeFormData): Promise<StyleCode> => {
  const response = await api.put(`${BASE_URL}/${id}`, styleCode);
  return response.data;
};

export const deleteStyleCode = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

export const toggleStyleCodeActive = async (id: number): Promise<StyleCode> => {
  const response = await api.patch(`${BASE_URL}/${id}/toggle-active`);
  return response.data;
};

const styleCodeService = {
  getAllStyleCodes,
  getActiveStyleCodes,
  getStyleCodeById,
  createStyleCode,
  updateStyleCode,
  deleteStyleCode,
  toggleStyleCodeActive
};

export default styleCodeService;
