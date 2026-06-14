export type AnalysisStatus = 'pending' | 'completed' | 'failed';

export type SupportedLanguage = 'javascript' | 'python';

export type TraceMode = 'planned' | 'executed' | 'error' | 'disabled' | null;

export type TraceStep = {
  step: number;
  line: number | null;
  type: string;
  description: string;
  variables: Record<string, unknown>;
  callStack: string[];
};

export type TraceSummary = {
  totalSteps: number;
  terminatedReason: string;
};

export type TraceResult = {
  returnedValue?: unknown;
};

export type TracePlanStep = {
  id: string;
  type: string;
  title: string;
  description: string;
  line: number | null;
};

export type TracePlan = {
  supported: boolean;
  steps: TracePlanStep[];
  limitations: string[];
};

export type TraceError = {
  code: string;
  message: string;
};

export type TraceMetadata = {
  language?: string;
  entryFunction?: string | null;
  analyzedAt?: string;
};

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
  trace_mode: TraceMode;
  trace_steps: TraceStep[] | null;
  trace_summary: TraceSummary | null;
  trace_result: TraceResult | null;
  trace_plan: TracePlan | null;
  trace_error: TraceError | null;
  trace_metadata: TraceMetadata | null;
  created_at: string;
  updated_at: string;
};

export type CreateAnalysisPayload = {
  title?: string;
  language: SupportedLanguage;
  source_code: string;
  entryFunction?: string | null;
  input?: unknown[];
};

export type AnalysisResponseData = {
  analysis: Analysis;
};

export type AnalysesListResponseData = {
  analyses: Analysis[];
};

export type AnalysisExportFormat = 'markdown' | 'json';

export type AnalysisExportData = {
  filename: string;
  format: AnalysisExportFormat;
  mime_type: string;
  content: string;
};

export type AnalysisShareData = {
  token: string;
  share_url: string;
  expires_at: string | null;
};
