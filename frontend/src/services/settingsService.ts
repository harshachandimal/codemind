import apiClient from './apiClient';
import type { UserSettings, UpdateUserSettingsPayload } from '../types/settings';

export async function getUserSettings(): Promise<UserSettings> {
  const response = await apiClient.get<{ data: UserSettings }>('/user/settings');
  return response.data.data;
}

export async function updateUserSettings(
  payload: UpdateUserSettingsPayload
): Promise<UserSettings> {
  const response = await apiClient.patch<{ data: UserSettings }>('/user/settings', payload);
  return response.data.data;
}
