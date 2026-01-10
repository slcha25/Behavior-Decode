
export type Language = 'en' | 'zh-TW' | 'zh-CN' | 'ja' | 'ko' | 'es' | 'fr' | 'ru' | 'ar';

export type UserPlan = 'free' | 'basic' | 'premium';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
}

export interface UsageState {
  plan: UserPlan;
  creditsRemaining: number;
  totalAnalyses: number;
  lastResetDate: string;
}

export interface EmotionalDataPoint {
  time: string;
  intensity: number;
  emotion: string;
}

export interface AnalysisReport {
  id?: string;
  date?: string;
  videoName?: string;
  summary: string;
  personality: string;
  intentions: string;
  motivation: string;
  emotionalTrajectory: EmotionalDataPoint[];
}

export interface MBTIResult {
  type: string;
  title: string;
  description: string;
  cognitiveFunctions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  REPORT = 'REPORT',
  PROFILE = 'PROFILE',
  HISTORY = 'HISTORY',
  ACCOUNT_DETAILS = 'ACCOUNT_DETAILS'
}

export enum ModelType {
  FLASH_LITE = 'gemini-flash-lite-latest',
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
}
