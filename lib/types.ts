export enum UserProfile {
  DIABETIC = 'DIABETIC',
  VEGAN = 'VEGAN',
  PALEO = 'PALEO',
}

// DeepPartial utility type for handling streaming partial data
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export enum AppStep {
  SETUP = 'SETUP',
  SCANNER = 'SCANNER',
  ANALYZING = 'ANALYZING',
}

export interface AnalysisResult {
  title: string;
  status: 'safe' | 'danger' | 'tradeoff';
  description: string;
  details: string[];
  metrics?: Array<{ name: string; value: number }>;
  pros?: string[];
  cons?: string[];
}
