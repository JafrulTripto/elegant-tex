import api from './api';
import { Tag } from '../types/tag';

const BASE_URL = '/tags';

export const searchTags = async (query: string) => {
  console.log(`Sending tag search request with query: "${query}"`);
  try {
    const response = await api.get(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
    console.log('Tag search response:', response.data);
    return response.data as Tag[];
  } catch (error) {
    console.error('Error in searchTags:', error);
    throw error;
  }
};

export const createTag = async (name: string) => {
  console.log(`Creating new tag with name: "${name}"`);
  try {
    const response = await api.post(BASE_URL, { name });
    console.log('Create tag response:', response.data);
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
