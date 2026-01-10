
import React from 'react';
import { AnalysisReport, Language } from '../types';
import { History, ChevronLeft, Calendar, FileVideo, ChevronRight, ScanSearch } from 'lucide-react';

interface AnalysisHistoryProps {
  history: AnalysisReport[];
  language: Language;
  onSelectReport: (report: AnalysisReport) => void;
  onBack: () => void;
}

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ history, language, onSelectReport, onBack }) => {
  const getTexts = (lang: Language) => {
    const translations: Record<Language, any> = {
      'en': { title: 'Analysis History', empty: 'No history found.', back: 'Back', view: 'View Report' },
      'zh-TW': { title: '分析歷史紀錄', empty: '尚無歷史紀錄', back: '返回', view: '查看報告' },
      'zh-CN': { title: '分析历史记录', empty: '尚无历史记录', back: '返回', view: '查看报告' },
      'ja': { title: '分析履歴', empty: '履歴はありません', back: '戻る', view: 'レポートを見る' },
      'ko': { title: '분석 기록', empty: '기록이 없습니다', back: '뒤로', view: '보고서 보기' },
      'es': { title: 'Historial', empty: 'Sin historial', back: 'Volver', view: 'Ver informe' },
      'fr': { title: 'Historique', empty: 'Aucun historique', back: 'Retour', view: 'Voir rapport' },
      'ru': { title: 'История', empty: 'История пуста', back: 'Назад', view: 'Смотреть' },
      'ar': { title: 'سجل التحليل', empty: 'لا يوجد سجل', back: 'رجوع', view: 'عرض التقرير' }
    };
    return translations[lang] || translations['en'];
  };
  const t = getTexts(language);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 hover:bg-soft-100 rounded-full transition-all text-soft-500"><ChevronLeft size={24} /></button>
        <h2 className="text-2xl font-black text-soft-900">{t.title}</h2>
      </div>
      {history.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 border border-soft-200 text-center flex flex-col items-center space-y-4">
          <div className="p-6 bg-soft-50 rounded-full text-soft-300"><ScanSearch size={48} /></div>
          <p className="text-soft-500 font-medium">{t.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item, idx) => (
            <div key={item.id || idx} onClick={() => onSelectReport(item)} className="bg-white p-6 rounded-[2rem] border border-soft-200 shadow-sm flex items-center justify-between group cursor-pointer hover:border-accent transition-all">
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-accent/5 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-colors"><FileVideo size={24} /></div>
                <div><h4 className="font-bold text-soft-800 line-clamp-1">{item.videoName || `Analysis ${idx + 1}`}</h4><div className="flex items-center space-x-3 text-xs text-soft-400 mt-1"><span className="flex items-center"><Calendar size={12} className="mr-1" /> {item.date || 'Recently'}</span></div></div>
              </div>
              <div className="flex items-center text-accent text-sm font-bold group-hover:translate-x-1 transition-transform"><span>{t.view}</span><ChevronRight size={18} className="ml-1" /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;
