import { useState, useEffect, useCallback } from 'react';
import { getUserSettings } from '../services/settingsService';
import type { UserSettings } from '../types/settings';

const DEFAULT_SETTINGS: UserSettings = {
  default_language: 'javascript',
  editor_font_size: 14,
  show_visual_explanations: true,
  show_runtime_trace: true,
  dashboard_density: 'comfortable',
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err);
      // fallback already in place as default state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return { settings, isLoading, error, reloadSettings: loadSettings };
};
