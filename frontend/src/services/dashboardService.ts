import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { DashboardAnalyticsData } from '../types/dashboard';

export async function getDashboardAnalytics(): Promise<DashboardAnalyticsData> {
  const response = await apiClient.get<ApiResponse<DashboardAnalyticsData>>(
    '/dashboard/analytics'
  );
  return response.data.data!;
}
