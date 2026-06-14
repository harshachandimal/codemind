import apiClient from './apiClient';
import { ApiResponse } from '../types/api';
import {
  Analysis,
  AnalysisResponseData,
  AnalysesListResponseData,
  CreateAnalysisPayload,
  AnalysisExportFormat,
  AnalysisExportData,
  AnalysisShareData,
} from '../types/analysis';

export async function createAnalysis(
  payload: CreateAnalysisPayload
): Promise<ApiResponse<AnalysisResponseData>> {
  const response = await apiClient.post<ApiResponse<AnalysisResponseData>>(
    '/analyses',
    payload
  );
  return response.data;
}

export async function getAnalyses(): Promise<ApiResponse<AnalysesListResponseData>> {
  const response = await apiClient.get<ApiResponse<AnalysesListResponseData>>('/analyses');
  return response.data;
}

export async function getAnalysis(
  id: number
): Promise<ApiResponse<AnalysisResponseData>> {
  const response = await apiClient.get<ApiResponse<AnalysisResponseData>>(`/analyses/${id}`);
  return response.data;
}

export async function deleteAnalysis(
  id: number
): Promise<ApiResponse<Record<string, never>>> {
  const response = await apiClient.delete<ApiResponse<Record<string, never>>>(`/analyses/${id}`);
  return response.data;
}

export async function exportAnalysis(
  analysisId: number | string,
  format: AnalysisExportFormat
): Promise<AnalysisExportData> {
  const response = await apiClient.get<ApiResponse<AnalysisExportData>>(
    `/analyses/${analysisId}/export`,
    { params: { format } }
  );
  // response.data.data is the AnalysisExportData object from the backend
  return response.data.data!;
}

export async function createAnalysisShare(
  analysisId: number | string,
  expiresInDays?: number
): Promise<AnalysisShareData> {
  const body = expiresInDays !== undefined ? { expires_in_days: expiresInDays } : {};
  const response = await apiClient.post<ApiResponse<AnalysisShareData>>(
    `/analyses/${analysisId}/share`,
    body
  );
  return response.data.data!;
}

export async function revokeAnalysisShare(
  analysisId: number | string
): Promise<void> {
  await apiClient.delete(`/analyses/${analysisId}/share`);
}

export async function getSharedAnalysis(token: string): Promise<Analysis> {
  const response = await apiClient.get<ApiResponse<Analysis>>(
    `/shared/analyses/${token}`
  );
  return response.data.data!;
}

