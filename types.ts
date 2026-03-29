export interface ViralPattern {
  id: string;
  title: string;
  hook: string;
  structure: string;
  tone: string;
  visualStyle: string;
  format?: string;
  audioStrategy?: string;
  cta?: string;
  keyTakeaways: string[];
  metrics?: {
    views?: string;
    likes?: string;
    comments?: string;
    shares?: string;
    saves?: string;
  };
  whyItWorked?: string;
  videoUrl?: string;
}

export interface CompetitorAnalysis {
  id: string;
  date: string;
  competitorNames: string;
  instagramLink?: string;
  productInfo: string;
  analysis: string;
}

export interface AppState {
  patterns: ViralPattern[];
  companyProfile: string;
  productInfo: string;
  competitorAnalyses: CompetitorAnalysis[];
}
