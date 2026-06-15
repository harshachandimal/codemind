export type LanguageCapability = {
  language: 'javascript' | 'python' | 'java';
  displayName: string;
  staticAnalysisSupported: boolean;
  runtimeTraceSupported: boolean;
  runtimeTraceEnabled: boolean;
  status: string;
  experimental: boolean;
  supportedFeatures: string[];
  unsupportedFeatures: string[];
  exampleEntryFunctionRequired: boolean;
  notes: string[];
};
