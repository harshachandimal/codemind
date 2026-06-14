export type DashboardDensity = 'comfortable' | 'compact';

export type DefaultLanguage = 'javascript' | 'python' | 'java';

export type UserSettings = {
  default_language: DefaultLanguage;
  editor_font_size: number;
  show_visual_explanations: boolean;
  show_runtime_trace: boolean;
  dashboard_density: DashboardDensity;
};

export type UpdateUserSettingsPayload = Partial<UserSettings>;
