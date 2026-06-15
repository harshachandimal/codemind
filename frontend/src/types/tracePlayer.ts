export type TracePlayerStep = {
  id: string;
  index: number;
  type: string;
  title: string;
  description: string;
  variables?: Record<string, unknown>;
  callStack?: string[];
  returnedValue?: unknown;
  lineNumber?: number | null;
  operation?: string | null;
  variableChanges?: string[];
  rawStep: unknown;
};

export type TracePlaybackState = {
  currentIndex: number;
  isPlaying: boolean;
  speedMs: number;
};
