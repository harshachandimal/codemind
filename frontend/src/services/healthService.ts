import apiClient from './apiClient';
import { ApiResponse, HealthData } from '../types/api';

export const getHealthStatus = async (): Promise<ApiResponse<HealthData>> => {
  const response = await apiClient.get<ApiResponse<HealthData>>('/health');
  return response.data;
};
