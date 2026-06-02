export type AnalysisStatus = 'pending' | 'completed' | 'failed';

export type SupportedLanguage = 'javascript';

export type Analysis = {
  id: number;
  title: string | null;
  language: SupportedLanguage;
  source_code: string;
  status: AnalysisStatus;
  time_complexity: string | null;
  space_complexity: string | null;
  detected_patterns: string[] | null;
  explanation: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateAnalysisPayload = {
  title?: string;
  language: SupportedLanguage;
  source_code: string;
};

export type AnalysisResponseData = {
  analysis: Analysis;
};

export type AnalysesListResponseData = {
  analyses: Analysis[];
};
