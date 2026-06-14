export type DashboardSummary = {
  total_analyses: number;
  completed_analyses: number;
  failed_analyses: number;
  pending_analyses: number;
};

export type DashboardBreakdownItem = {
  label: string;
  count: number;
};

export type DashboardRecentActivity = {
  last_7_days: number;
  last_30_days: number;
};

export type DashboardLatestAnalysis = {
  id: number;
  title: string | null;
  language: string;
  status: string;
  time_complexity: string | null;
  created_at: string;
};

export type DashboardAnalyticsData = {
  summary: DashboardSummary;
  language_breakdown: DashboardBreakdownItem[];
  time_complexity_breakdown: DashboardBreakdownItem[];
  space_complexity_breakdown: DashboardBreakdownItem[];
  detected_pattern_breakdown: DashboardBreakdownItem[];
  trace_mode_breakdown: DashboardBreakdownItem[];
  recent_activity: DashboardRecentActivity;
  latest_analyses: DashboardLatestAnalysis[];
};
