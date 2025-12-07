
export type Language = 'en' | 'zh-TW' | 'zh-CN' | 'ja' | 'ko' | 'es' | 'fr' | 'ru' | 'ar';

export interface EmotionalDataPoint {
  time: string;
  intensity: number;
  emotion: string;
}

export interface AnalysisReport {
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
}

export enum ModelType {
  FLASH_LITE = 'gemini-flash-lite-latest',
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
}
