
import React from 'react';
import { User, UsageState, Language } from '../types';
import { User as UserIcon, History, ChevronRight, Plus, Sparkles, Activity } from 'lucide-react';

interface UserProfileProps {
  user: User;
  usage: UsageState;
  language: Language;
  onAddCredits: () => void;
  onViewHistory: () => void;
  onViewAccountDetails: () => void;
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, usage, language, onAddCredits, onViewHistory, onViewAccountDetails, onBack }) => {
  const getTexts = (lang: Language) => {
    const translations: Record<Language, any> = {
      'en': { title: 'My Profile', credits: 'Credits Left', plan: 'Plan', add: 'Buy Credits', back: 'Back', info: 'Settings', history: 'History' },
      'zh-TW': { title: '個人主頁', credits: '剩餘點數', plan: '方案', add: '購買點數', back: '返回', info: '帳戶設置', history: '歷史紀錄' },
      'zh-CN': { title: '个人主页', credits: '剩余点数', plan: '方案', add: '购买点数', back: '返回', info: '账户设置', history: '历史记录' },
      'ja': { title: 'プロフィール', credits: '残り', plan: 'プラン', add: 'チャージ', back: '戻る', info: '設定', history: '履歴' },
      'ko': { title: '프로필', credits: '잔액', plan: '플랜', add: '충전', back: '뒤로', info: '설정', history: '기록' },
      'es': { title: 'Mi Perfil', credits: 'Créditos', plan: 'Plan', add: 'Comprar', back: 'Volver', info: 'Ajustes', history: 'Historial' },
      'fr': { title: 'Mon Profil', credits: 'Crédits', plan: 'Offre', add: 'Acheter', back: 'Retour', info: 'Paramètres', history: 'Historique' },
      'ru': { title: 'Профиль', credits: 'Кредиты', plan: 'Тариф', add: 'Купить', back: 'Назад', info: 'Настройки', history: 'История' },
      'ar': { title: 'ملفي الشخصي', credits: 'الرصيد', plan: 'الخطة', add: 'شحن', back: 'رجوع', info: 'الإعدادات', history: 'السجل' }
    };
    return translations[lang] || translations['en'];
  };
  const t = getTexts(language);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="flex items-center justify-between"><h2 className="text-3xl font-black text-soft-900 tracking-tight">{t.title}</h2><button onClick={onBack} className="text-soft-500 hover:text-accent font-bold transition-colors">{t.back}</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-soft-800 to-soft-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between"><p className="text-soft-400 text-xs font-bold uppercase tracking-widest">{t.credits}</p><div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full"><Sparkles size={12} className="text-yellow-400" /><span className="text-[10px] uppercase font-bold text-soft-300">{usage.plan}</span></div></div>
            <h4 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">{usage.creditsRemaining}</h4>
            <button onClick={onAddCredits} className="w-full bg-accent hover:bg-accent-dark text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl shadow-accent/30 transition-all hover:scale-[1.02] active:scale-[0.98]"><Plus size={20} /><span>{t.add}</span></button>
          </div>
          <Activity className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-soft-200 shadow-sm flex items-center justify-between group cursor-pointer hover:border-accent transition-all" onClick={onViewAccountDetails}>
            <div className="flex items-center space-x-4"><div className="p-4 bg-soft-50 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-colors"><UserIcon size={24} /></div><div><p className="text-sm font-bold text-soft-800">{t.info}</p><p className="text-xs text-soft-500">{user.email}</p></div></div><ChevronRight size={20} className="text-soft-300 group-hover:text-accent" />
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-soft-200 shadow-sm flex items-center justify-between group cursor-pointer hover:border-accent transition-all" onClick={onViewHistory}>
            <div className="flex items-center space-x-4"><div className="p-4 bg-soft-50 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-colors"><History size={24} /></div><div><p className="text-sm font-bold text-soft-800">{t.history}</p><p className="text-xs text-soft-500">{usage.totalAnalyses} items</p></div></div><ChevronRight size={20} className="text-soft-300 group-hover:text-accent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
