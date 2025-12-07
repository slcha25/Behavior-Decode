
import React, { useState } from 'react';
import { AnalysisReport as ReportType, Language, MBTIResult } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Heart, Sparkles, Fingerprint, Loader2, ScanEye, Activity } from 'lucide-react';
import { analyzeMBTI } from '../services/geminiService';

interface Props {
  report: ReportType;
  language: Language;
}

// Reusable text formatter for reports
const FormatText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <span key={index} className="font-bold text-indigo-900 bg-indigo-50 px-1 rounded mx-0.5">{part.slice(2, -2)}</span>;
        }
        return part;
      })}
    </span>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; content: string; delay: string; colorClass?: string }> = ({ title, icon, content, delay, colorClass = "text-soft-800" }) => (
  <div className={`bg-white p-8 rounded-3xl shadow-sm border border-soft-200 transition-all duration-500 ${delay} animate-fade-in-up hover:shadow-md`}>
    <div className="flex items-center space-x-3 mb-6 border-b border-soft-100 pb-4">
      <div className="p-2.5 bg-soft-50 rounded-xl text-accent border border-soft-100">
        {icon}
      </div>
      <h3 className={`text-xl font-bold tracking-tight ${colorClass}`}>{title}</h3>
    </div>
    <div className="text-soft-700 leading-8 text-lg font-light tracking-wide text-justify">
      <FormatText text={content} />
    </div>
  </div>
);

const AnalysisReportView: React.FC<Props> = ({ report, language }) => {
  const [mbti, setMbti] = useState<MBTIResult | null>(null);
  const [loadingMBTI, setLoadingMBTI] = useState(false);

  const getTexts = (lang: Language) => {
    const base = {
      summary: 'Behavioral Summary',
      personality: 'Character Personality Analysis',
      intentions: 'Behavior Analysis & Intentions',
      motivation: 'Behavior Motivation',
      chartTitle: 'Emotional Intensity Trajectory',
      analyzeMBTI: 'Analyze MBTI Type',
      mbtiTitle: 'MBTI Personality Analysis',
      cognitive: 'Cognitive Functions',
    };

    switch (lang) {
      case 'zh-TW': return { ...base, summary: '行為摘要', personality: '人物個性分析', intentions: '行為分析與意圖', motivation: '影片行為動機', chartTitle: '情緒強度軌跡', analyzeMBTI: '分析 MBTI 人格類型', mbtiTitle: 'MBTI 人格分析', cognitive: '認知功能' };
      case 'zh-CN': return { ...base, summary: '行为摘要', personality: '人物个性分析', intentions: '行为分析与意图', motivation: '视频行为动机', chartTitle: '情绪强度轨迹', analyzeMBTI: '分析 MBTI 人格类型', mbtiTitle: 'MBTI 人格分析', cognitive: '认知功能' };
      case 'ja': return { ...base, summary: '行動の要約', personality: 'キャラクター性格分析', intentions: '行動分析と意図', motivation: '行動の動機', chartTitle: '感情強度の軌跡', analyzeMBTI: 'MBTIタイプを分析', mbtiTitle: 'MBTI性格分析', cognitive: '認知機能' };
      case 'ko': return { ...base, summary: '행동 요약', personality: '인물 성격 분석', intentions: '행동 분석 및 의도', motivation: '행동 동기', chartTitle: '감정 강도 궤적', analyzeMBTI: 'MBTI 유형 분석', mbtiTitle: 'MBTI 성격 분석', cognitive: '인지 기능' };
      case 'es': return { ...base, summary: 'Resumen de Comportamiento', personality: 'Análisis de Personalidad', intentions: 'Análisis de Comportamiento e Intenciones', motivation: 'Motivación del Comportamiento', chartTitle: 'Trayectoria de Intensidad Emocional', analyzeMBTI: 'Analizar Tipo MBTI', mbtiTitle: 'Análisis de Personalidad MBTI', cognitive: 'Funciones Cognitivas' };
      case 'fr': return { ...base, summary: 'Résumé Comportemental', personality: 'Analyse de la Personnalité', intentions: 'Analyse Comportementale et Intentions', motivation: 'Motivation Comportementale', chartTitle: 'Trajectoire de l\'Intensité Émotionnelle', analyzeMBTI: 'Analyser le Type MBTI', mbtiTitle: 'Analyse de Personnalité MBTI', cognitive: 'Fonctions Cognitives' };
      case 'ru': return { ...base, summary: 'Поведенческое Резюме', personality: 'Анализ Личности', intentions: 'Анализ Поведения и Намерения', motivation: 'Мотивация Поведения', chartTitle: 'Траектория Эмоциональной Интенсивности', analyzeMBTI: 'Анализ типа MBTI', mbtiTitle: 'Анализ личности MBTI', cognitive: 'Когнитивные функции' };
      case 'ar': return { ...base, summary: 'ملخص السلوك', personality: 'تحليل شخصية الشخصية', intentions: 'تحليل السلوك والنوايا', motivation: 'دوافع السلوك', chartTitle: 'مسار الكثافة العاطفية', analyzeMBTI: 'تحليل نمط MBTI', mbtiTitle: 'تحليل شخصية MBTI', cognitive: 'الوظائف المعرفية' };
      default: return base;
    }
  };

  const t = getTexts(language);

  const handleAnalyzeMBTI = async () => {
    setLoadingMBTI(true);
    try {
      const result = await analyzeMBTI(report, language);
      setMbti(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMBTI(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      
      {/* 1. Summary Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 md:p-10 rounded-3xl text-white shadow-xl animate-fade-in relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center tracking-tight">
            <Sparkles className="mr-3 text-yellow-300" /> {t.summary}
          </h2>
          <div className="text-indigo-50 text-lg md:text-xl leading-relaxed font-light opacity-95">
             <FormatText text={report.summary} />
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* 2. Personality Analysis */}
      <Section 
        title={t.personality} 
        icon={<Brain size={24} />} 
        content={report.personality}
        delay="delay-100"
      />

      {/* 3. Motivation */}
       <Section 
        title={t.motivation} 
        icon={<Heart size={24} />} 
        content={report.motivation}
        delay="delay-200"
      />

      {/* 4. Intentions / Behavior Analysis */}
      <Section 
        title={t.intentions} 
        icon={<ScanEye size={24} />} 
        content={report.intentions}
        delay="delay-300"
      />

      {/* Chart Section */}
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-soft-200 animate-fade-in delay-500">
        <h3 className="text-lg font-semibold text-soft-800 mb-8 flex items-center">
            <Activity className="mr-2 text-accent" size={20} />
            {t.chartTitle}
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.emotionalTrajectory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                hide 
                domain={[0, 100]} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="intensity" 
                stroke="#6366f1" 
                strokeWidth={4} 
                dot={{ fill: '#6366f1', strokeWidth: 3, r: 6, stroke: '#fff' }}
                activeDot={{ r: 10 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. MBTI Section */}
      <div className="animate-fade-in delay-500 pt-4">
        {!mbti ? (
           <button 
             onClick={handleAnalyzeMBTI}
             disabled={loadingMBTI}
             className="w-full py-8 rounded-3xl border-2 border-dashed border-accent/30 text-accent font-medium hover:bg-accent/5 hover:border-accent transition-all flex items-center justify-center space-x-3 text-xl shadow-sm hover:shadow-md"
           >
             {loadingMBTI ? (
               <>
                 <Loader2 className="animate-spin" size={28} />
                 <span>Analyzing Personality Type...</span>
               </>
             ) : (
               <>
                 <Fingerprint size={28} />
                 <span>{t.analyzeMBTI}</span>
               </>
             )}
           </button>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-accent/10 p-8 md:p-10 shadow-lg overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Fingerprint size={200} />
             </div>
             <div className="relative z-10">
               <h3 className="text-xl font-bold text-soft-800 mb-8 flex items-center">
                 <Fingerprint className="mr-3 text-accent" /> {t.mbtiTitle}
               </h3>
               
               <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center bg-soft-50 p-8 rounded-3xl border border-soft-100 min-w-[200px]">
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-accent to-purple-600 tracking-widest">
                      {mbti.type}
                    </span>
                    <span className="text-lg font-medium text-soft-500 mt-4">{mbti.title}</span>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                     <p className="text-soft-700 leading-relaxed text-lg text-justify">
                       {mbti.description}
                     </p>
                     
                     <div className="bg-soft-50 p-6 rounded-2xl">
                        <h4 className="text-sm font-semibold text-soft-800 mb-4 uppercase tracking-wide opacity-70">{t.cognitive}</h4>
                        <ul className="space-y-3">
                          {mbti.cognitiveFunctions.map((func, i) => (
                            <li key={i} className="text-base text-soft-600 flex items-start">
                              <span className="mr-3 text-accent text-lg">•</span> {func}
                            </li>
                          ))}
                        </ul>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisReportView;
