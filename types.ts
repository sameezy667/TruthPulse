
export enum UserProfile {
  DIABETIC = 'DIABETIC',
  VEGAN = 'VEGAN',
  PALEO = 'PALEO'
}

export enum AppStep {
  SETUP = 'SETUP',
  SCANNER = 'SCANNER',
  REASONING = 'REASONING',
  RESULT = 'RESULT'
}

export interface AnalysisResult {
  title: string;
  status: 'safe' | 'danger' | 'tradeoff';
  description: string;
  details: string[];
  metrics?: { name: string; value: number }[];
  pros?: string[];
  cons?: string[];
}
