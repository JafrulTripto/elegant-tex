import api from './api';
import { Tag } from '../types/tag';

const BASE_URL = '/tags';

export const searchTags = async (query: string) => {
  try {
    const response = await api.get(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
    return response.data as Tag[];
  } catch (error) {
    console.error('Error in searchTags:', error);
    throw error;
  }
};

export const createTag = async (name: string) => {
  try {
    const response = await api.post(BASE_URL, { name });
    return response.data as Tag;
  } catch (error) {
    console.error('Error in createTag:', error);
    throw error;
  }
};

const tagService = {
  searchTags,
  createTag,
};

export default tagService;
