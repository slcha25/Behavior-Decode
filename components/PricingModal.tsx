
import React, { useState } from 'react';
import { X, ShieldCheck, Zap, CreditCard } from 'lucide-react';
import { UserPlan, Language } from '../types';
import { processPayment } from '../services/usageService';
import StripeSimulation from './StripeSimulation';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSuccess: () => void;
  onPromptLogin: () => void;
  isLoggedIn: boolean;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, language, onSuccess, onPromptLogin, isLoggedIn }) => {
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);
  const [showStripe, setShowStripe] = useState(false);

  if (!isOpen) return null;

  const handleInitiateUpgrade = (plan: UserPlan) => {
    if (!isLoggedIn) {
      onPromptLogin();
      return;
    }
    setSelectedPlan(plan);
    setShowStripe(true);
  };

  const handlePaymentSuccess = async () => {
    if (selectedPlan) {
      await processPayment(selectedPlan);
      onSuccess();
      setShowStripe(false);
      onClose();
    }
  };

  const translations: Record<Language, any> = {
    'en': {
      title: 'Summary of Prices to Charge',
      feature: 'Feature',
      free: 'Free Tier',
      basic: 'Basic (One-Time)',
      premium: 'Premium (Monthly)',
      price: 'Price',
      limit: 'Analysis Limit',
      chat: 'Real-time AI Chat',
      mbti: 'MBTI Personality Analyst',
      total: 'Total',
      perMonth: 'Per Month',
      yes: 'Yes',
      no: 'No',
      cta: 'Upgrade Now',
      secure: 'Secure payment via Stripe'
    },
    'zh-TW': {
      title: '費用方案總覽',
      feature: '功能',
      free: '免費方案',
      basic: '基礎版 (一次性)',
      premium: '專業版 (月費)',
      price: '價格',
      limit: '分析次數上限',
      chat: '即時 AI 對話',
      mbti: 'MBTI 人格分析',
      total: '共',
      perMonth: '每月',
      yes: '是',
      no: '否',
      cta: '立即升級',
      secure: '透過 Stripe 安全支付'
    },
    'zh-CN': {
      title: '费用方案总览',
      feature: '功能',
      free: '免费方案',
      basic: '基础版 (一次性)',
      premium: '专业版 (月费)',
      price: '价格',
      limit: '分析次数上限',
      chat: '即时 AI 对话',
      mbti: 'MBTI 人格分析',
      total: '共',
      perMonth: '每月',
      yes: '是',
      no: '否',
      cta: '立即升级',
      secure: '通过 Stripe 安全支付'
    },
    'ja': {
      title: '料金プランの概要',
      feature: '機能',
      free: '無料プラン',
      basic: 'ベーシック (買い切り)',
      premium: 'プレミアム (月額)',
      price: '価格',
      limit: '分析回数上限',
      chat: 'リアルタイム AI チャット',
      mbti: 'MBTI 性格分析',
      total: '合計',
      perMonth: '毎月',
      yes: 'はい',
      no: 'いいえ',
      cta: '今すぐアップグレード',
      secure: 'Stripe による安全な決済'
    },
    'ko': {
      title: '요금 플랜 요약',
      feature: '기능',
      free: '무료 티어',
      basic: '베이직 (일회성)',
      premium: '프리미엄 (월간)',
      price: '가격',
      limit: '분석 한도',
      chat: '실시간 AI 채팅',
      mbti: 'MBTI 성격 분석',
      total: '총',
      perMonth: '매월',
      yes: '예',
      no: '아니오',
      cta: '지금 업그레이드',
      secure: 'Stripe을 통한 안전한 결제'
    },
    'es': {
      title: 'Resumen de Precios',
      feature: 'Característica',
      free: 'Nivel Gratuito',
      basic: 'Básico (Único)',
      premium: 'Premium (Mensual)',
      price: 'Precio',
      limit: 'Límite de Análisis',
      chat: 'Chat AI en Tiempo Real',
      mbti: 'Analista de MBTI',
      total: 'Total',
      perMonth: 'Por Mes',
      yes: 'Sí',
      no: 'No',
      cta: 'Actualizar Ahora',
      secure: 'Pago seguro vía Stripe'
    },
    'fr': {
      title: 'Résumé des Tarifs',
      feature: 'Fonctionnalité',
      free: 'Niveau Gratuit',
      basic: 'Basique (Unique)',
      premium: 'Premium (Mensual)',
      price: 'Prix',
      limit: 'Limite d\'Analyse',
      chat: 'Chat AI en Temps Réel',
      mbti: 'Analyste MBTI',
      total: 'Total',
      perMonth: 'Par Mois',
      yes: 'Oui',
      no: 'Non',
      cta: 'Mettre à Niveau',
      secure: 'Paiement sécurisé via Stripe'
    },
    'ru': {
      title: 'Обзор Тарифов',
      feature: 'Функция',
      free: 'Бесплатный уровень',
      basic: 'Базовый (Разово)',
      premium: 'Премиум (Ежемесячно)',
      price: 'Цена',
      limit: 'Лимит Анализов',
      chat: 'Чат с AI в реальном времени',
      mbti: 'MBTI Анализ личности',
      total: 'Всего',
      perMonth: 'В месяц',
      yes: 'Да',
      no: 'Нет',
      cta: 'Обновить сейчас',
      secure: 'Безопасная оплата через Stripe'
    },
    'ar': {
      title: 'ملخص الأسعار',
      feature: 'الميزة',
      free: 'المستوى المجاني',
      basic: 'أساسي (مرة واحدة)',
      premium: 'مميز (شهري)',
      price: 'السعر',
      limit: 'حد التحليل',
      chat: 'دردشة AI فورية',
      mbti: 'محلل الشخصية MBTI',
      total: 'إجمالي',
      perMonth: 'شهرياً',
      yes: 'نعم',
      no: 'لا',
      cta: 'ترقية الآن',
      secure: 'دفع آمن عبر Stripe'
    }
  };

  const t = translations[language] || translations['en'];

  if (showStripe && selectedPlan) {
    return (
      <StripeSimulation 
        plan={selectedPlan} 
        language={language} 
        onSuccess={handlePaymentSuccess} 
        onCancel={() => setShowStripe(false)} 
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-soft-900/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 bg-[#0a0a0a] z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t.title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white transition-colors hover:bg-white/5 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 md:p-10 custom-scrollbar">
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-white/50 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                  <th className="pb-6 w-1/4">{t.feature}</th>
                  <th className="pb-6 w-1/4">{t.free}</th>
                  <th className="pb-6 w-1/4">{t.basic}</th>
                  <th className="pb-6 w-1/4">{t.premium}</th>
                </tr>
              </thead>
              <tbody className="text-white/90">
                {/* Price Row */}
                <tr className="border-b border-white/5">
                  <td className="py-6 font-bold text-base md:text-lg">{t.price}</td>
                  <td className="py-6 text-white/60">$0</td>
                  <td className="py-6 text-accent font-black text-xl">$5.00</td>
                  <td className="py-6 text-purple-400 font-black text-xl">$15.00<span className="text-xs font-normal text-white/40 ml-1">/{language === 'zh-TW' || language === 'zh-CN' ? '月' : 'mo'}</span></td>
                </tr>
                {/* Analysis Limit Row */}
                <tr className="border-b border-white/5">
                  <td className="py-6 font-medium">{t.limit}</td>
                  <td className="py-6">3 {t.total}</td>
                  <td className="py-6 font-semibold">10 {t.total}</td>
                  <td className="py-6 font-semibold">50 {t.perMonth}</td>
                </tr>
                {/* Chat Row */}
                <tr className="border-b border-white/5">
                  <td className="py-6 font-medium">{t.chat}</td>
                  <td className="py-6 text-green-400 font-bold">{t.yes}</td>
                  <td className="py-6 text-green-400 font-bold">{t.yes}</td>
                  <td className="py-6 text-green-400 font-bold">{t.yes}</td>
                </tr>
                {/* MBTI Row */}
                <tr className="border-b border-white/5">
                  <td className="py-6 font-medium">{t.mbti}</td>
                  <td className="py-6 text-green-400 font-bold">{t.yes}</td>
                  <td className="py-6 text-green-400 font-bold">{t.yes}</td>
                  <td className="py-6 text-green-400 font-bold">{t.yes}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="hidden md:block"></div>
            <button 
              onClick={() => handleInitiateUpgrade('basic')}
              className="group relative bg-white text-black py-4 px-6 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              <Zap size={20} />
              <span>{t.cta} (Basic)</span>
            </button>
            <button 
              onClick={() => handleInitiateUpgrade('premium')}
              className="group relative bg-accent text-white py-4 px-6 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-accent/30"
            >
              <ShieldCheck size={20} />
              <span>{t.cta} (Premium)</span>
            </button>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 border-t border-white/5 bg-[#0a0a0a] flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-white/30 text-xs">
            <CreditCard size={14} />
            <span>{t.secure}</span>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default PricingModal;
