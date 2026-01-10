
import { UsageState, UserPlan, User, AnalysisReport } from '../types';
import { getCurrentUser } from './authService';

const USAGE_PREFIX = 'behaviordecode_usage_';
const ANONYMOUS_KEY = 'behaviordecode_usage_anonymous';
const HISTORY_PREFIX = 'behaviordecode_history_';

const getInitialUsage = (plan: UserPlan = 'free'): UsageState => {
  const limits = {
    free: 3,
    basic: 10,
    premium: 50
  };
  
  return {
    plan,
    creditsRemaining: limits[plan],
    totalAnalyses: 0,
    lastResetDate: new Date().toISOString(),
  };
};

export const getUsage = (): UsageState => {
  const user = getCurrentUser();
  const storageKey = user ? USAGE_PREFIX + user.email : ANONYMOUS_KEY;

  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    const initial = getInitialUsage();
    saveUsage(initial);
    return initial;
  }

  const parsed = JSON.parse(stored);
  
  // Handle monthly reset for premium subscriptions
  if (parsed.plan === 'premium') {
    const lastReset = new Date(parsed.lastResetDate);
    const now = new Date();
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      parsed.creditsRemaining = 50;
      parsed.lastResetDate = now.toISOString();
      saveUsage(parsed);
    }
  }
  
  return parsed;
};

export const saveUsage = (usage: UsageState) => {
  const user = getCurrentUser();
  const storageKey = user ? USAGE_PREFIX + user.email : ANONYMOUS_KEY;
  localStorage.setItem(storageKey, JSON.stringify(usage));
};

export const deductCredit = (): boolean => {
  const usage = getUsage();
  if (usage.creditsRemaining <= 0) return false;
  
  usage.creditsRemaining -= 1;
  usage.totalAnalyses += 1;
  saveUsage(usage);
  return true;
};

export const getHistory = (): AnalysisReport[] => {
  const user = getCurrentUser();
  if (!user) return [];
  const key = HISTORY_PREFIX + user.email;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

export const saveToHistory = (report: AnalysisReport) => {
  const user = getCurrentUser();
  if (!user) return;
  const key = HISTORY_PREFIX + user.email;
  const history = getHistory();
  const newHistory = [report, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem(key, JSON.stringify(newHistory));
};

export const getLimits = (plan: UserPlan) => {
  switch (plan) {
    case 'basic': return 10;
    case 'premium': return 50;
    default: return 3;
  }
};

export const isLimitReached = (): boolean => {
  const usage = getUsage();
  return usage.creditsRemaining <= 0;
};

export const canUseChat = (): boolean => true;

export const processPayment = async (plan: UserPlan): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = getCurrentUser();
      // Payments require a user account
      if (!user) {
        resolve(false);
        return;
      }
      
      const current = getUsage();
      const newLimits = getLimits(plan);
      
      saveUsage({
        ...current,
        plan: plan,
        creditsRemaining: current.creditsRemaining + newLimits, // Add purchased credits
        lastResetDate: new Date().toISOString()
      });
      resolve(true);
    }, 2000);
  });
};
