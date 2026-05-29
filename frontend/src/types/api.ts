export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, unknown>;
};

export type HealthData = {
  app: string;
  database: string;
};
