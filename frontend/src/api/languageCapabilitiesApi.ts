import apiClient from '../services/apiClient';
import { LanguageCapability } from '../types/languageCapabilities';

export const getLanguageCapabilities = async (): Promise<LanguageCapability[]> => {
  const response = await apiClient.get('/languages/capabilities');
  return response.data.data;
};
