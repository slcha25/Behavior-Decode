
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AppState, AnalysisReport, Language } from './types';
import VideoUploader from './components/VideoUploader';
import AnalysisReportView from './components/AnalysisReport';
import ChatInterface from './components/ChatInterface';
import { analyzeVideoBehavior, getFastQuickReply } from './services/geminiService';
import { Scan, Brain, Sparkles, ChevronRight, Activity, Globe, AlertTriangle } from 'lucide-react';

interface VideoContent {
  inlineData?: { mimeType: string; data: string };
  fileData?: { fileUri: string; mimeType: string };
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [language, setLanguage] = useState<Language>('en');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoContent, setVideoContent] = useState<VideoContent | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loadingText, setLoadingText] = useState("Initializing Gemini Pro...");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set direction for Arabic
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const getTexts = (lang: Language) => {
    switch (lang) {
      case 'zh-TW': return { title: "BehaviorDecode", psychology: '心理學', intentions: '意圖', version: 'v1.0 • Gemini 3 Pro', heroBadge: '由高階影片理解技術驅動', heroTitle: <>解讀行為背後的<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">原因</span></>, heroSubtitle: '上傳影片，利用高階心理側寫解讀人物個性、隱藏意圖與情緒驅動力。', features: ['微表情', '語氣分析', '姿態解讀', '情境感知'], consulting: '正在諮詢行為心理學模型...', home: '首頁', reportTitle: '分析報告', error: '分析失敗。', tryAgain: '請重試。' };
      case 'zh-CN': return { title: "BehaviorDecode", psychology: '心理学', intentions: '意图', version: 'v1.0 • Gemini 3 Pro', heroBadge: '由高阶视频理解技术驱动', heroTitle: <>解读行为背后的<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">原因</span></>, heroSubtitle: '上传视频，利用高阶心理侧写解读人物个性、隐藏意图与情绪驱动力。', features: ['微表情', '语气分析', '姿态解读', '情境感知'], consulting: '正在咨询行为心理学模型...', home: '首页', reportTitle: '分析报告', error: '分析失败。', tryAgain: '请重试。' };
      case 'ja': return { title: "BehaviorDecode", psychology: '心理学', intentions: '意図', version: 'v1.0 • Gemini 3 Pro', heroBadge: '高度な動画理解技術', heroTitle: <>行動の裏にある<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">理由</span>を解読</>, heroSubtitle: '動画をアップロードして、高度な心理プロファイリングで性格、隠された意図、感情の要因を解読します。', features: ['微表情', '声のトーン', '姿勢分析', '文脈認識'], consulting: '行動心理学モデルに問い合わせ中...', home: 'ホーム', reportTitle: '分析レポート', error: '分析失敗。', tryAgain: '再試行してください。' };
      case 'ko': return { title: "BehaviorDecode", psychology: '심리학', intentions: '의도', version: 'v1.0 • Gemini 3 Pro', heroBadge: '고급 비디오 이해 기술', heroTitle: <>행동 이면의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">이유</span>를 해석</>, heroSubtitle: '비디오를 업로드하여 고급 심리 프로파일링을 통해 성격, 숨겨진 의도 및 감정 동인을 해독하세요.', features: ['미세 표정', '어조 분석', '자세 분석', '맥락 인식'], consulting: '행동 심리학 모델 상담 중...', home: '홈', reportTitle: '분석 보고서', error: '분석 실패.', tryAgain: '다시 시도해 주세요.' };
      case 'es': return { title: "BehaviorDecode", psychology: 'Psicología', intentions: 'Intenciones', version: 'v1.0 • Gemini 3 Pro', heroBadge: 'Comprensión Avanzada de Video', heroTitle: <>Entiende el <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">Porqué</span> de la acción.</>, heroSubtitle: 'Sube un video para decodificar la personalidad del personaje, intenciones ocultas y motores emocionales.', features: ['Microexpresiones', 'Análisis de Tono', 'Lectura de Postura', 'Contexto'], consulting: 'Consultando modelos psicológicos...', home: 'Inicio', reportTitle: 'Reporte de Análisis', error: 'Análisis fallido.', tryAgain: 'Intenta de nuevo.' };
      case 'fr': return { title: "BehaviorDecode", psychology: 'Psychologie', intentions: 'Intentions', version: 'v1.0 • Gemini 3 Pro', heroBadge: 'Compréhension Vidéo Avancée', heroTitle: <>Comprenez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">Pourquoi</span> de l'action.</>, heroSubtitle: 'Téléchargez une vidéo pour décoder la personnalité, les intentions cachées et les moteurs émotionnels.', features: ['Micro-expressions', 'Analyse de Ton', 'Lecture de Posture', 'Contexte'], consulting: 'Consultation des modèles...', home: 'Accueil', reportTitle: 'Rapport d\'Analyse', error: 'Échec de l\'analyse.', tryAgain: 'Réessayez.' };
      case 'ru': return { title: "BehaviorDecode", psychology: 'Психология', intentions: 'Намерения', version: 'v1.0 • Gemini 3 Pro', heroBadge: 'Продвинутый Анализ Видео', heroTitle: <>Поймите <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">Причину</span> действий.</>, heroSubtitle: 'Загрузите видео для расшифровки личности персонажа, скрытых намерений и эмоциональных драйверов.', features: ['Микровыражения', 'Анализ тона', 'Поза', 'Контекст'], consulting: 'Консультация с моделями...', home: 'Главная', reportTitle: 'Отчет анализа', error: 'Ошибка анализа.', tryAgain: 'Попробуйте снова.' };
      case 'ar': return { title: "BehaviorDecode", psychology: 'علم النفس', intentions: 'النوايا', version: 'v1.0 • Gemini 3 Pro', heroBadge: 'مدعوم بتقنية فهم الفيديو', heroTitle: <>افهم <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">السبب</span> وراء الفعل.</>, heroSubtitle: 'ارفع فيديو لفك رموز شخصية الشخصيات، والنوايا الخفية، والدوافع العاطفية باستخدام التنميط النفسي المتقدم.', features: ['تعبيرات دقيقة', 'تحليل النبرة', 'قراءة الوضعية', 'الوعي بالسياق'], consulting: 'جاري استشارة النماذج النفسية...', home: 'الرئيسية', reportTitle: 'تقرير التحليل', error: 'فشل التحليل.', tryAgain: 'حاول مرة أخرى.' };
      default: return { title: "BehaviorDecode", psychology: 'Psychology', intentions: 'Intentions', version: 'v1.0 • Gemini 3 Pro', heroBadge: 'Powered by Advanced Video Understanding', heroTitle: <>Understand the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">Why</span> behind the action.</>, heroSubtitle: 'Upload a video to decode character personality, hidden intentions, and emotional drivers using advanced psychological profiling.', features: ['Micro-expressions', 'Tone Analysis', 'Posture Reading', 'Context Awareness'], consulting: 'Consulting behavioral psychology models...', home: 'Home', reportTitle: 'Analysis Report', error: 'Analysis failed.', tryAgain: 'Please try again.' };
    }
  };

  const t = getTexts(language);

  // Initial load - demonstrate Flash Lite for fast response
  useEffect(() => {
    getFastQuickReply("human behavior analysis", language);
  }, [language]);

  const handleFileSelect = async (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setErrorMsg(null);
    startAnalysis(file);
  };

  const startAnalysis = async (file: File) => {
    setState(AppState.ANALYZING);
    setLoadingText(t.consulting);
    setProgress(0);

    try {
      const result = await analyzeVideoBehavior(file, language, (status, pct) => {
        setLoadingText(status);
        setProgress(pct);
      });
      
      setReport(result.report);
      setVideoContent(result.videoContent);
      setState(AppState.REPORT);
    } catch (error: any) {
      console.error("Process failed", error);
      setState(AppState.IDLE);
      setErrorMsg(`${t.error} ${error.message || t.tryAgain}`);
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }
    }
  };

  const handleReset = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setState(AppState.IDLE);
    setVideoFile(null);
    setVideoUrl(null);
    setVideoContent(null);
    setReport(null);
    setErrorMsg(null);
    setProgress(0);
  };

  const languages: { code: Language, label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'zh-CN', label: '简体中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'ru', label: 'Русский' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <div className={`min-h-screen bg-soft-50 font-sans text-soft-900 selection:bg-accent selection:text-white ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-soft-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleReset}>
            <div className="bg-accent text-white p-2 rounded-xl shadow-lg shadow-accent/30">
              <Scan size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-soft-800 hidden md:inline">Behavior<span className="text-accent">Decode</span></span>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6 text-sm font-medium text-soft-500">
            {/* Language Selector */}
            <div className="relative group h-full flex items-center">
              <button className="flex items-center hover:text-accent transition-colors px-3 py-1 rounded-full border border-transparent hover:border-soft-200">
                <Globe size={16} className="mr-2" />
                <span className="uppercase">{language}</span>
              </button>
              {/* Invisible bridge (padding-top) prevents menu from closing when moving mouse from button to menu */}
              <div className="absolute right-0 top-full pt-4 w-40 hidden group-hover:block animate-fade-in z-50">
                 <div className="bg-white border border-soft-200 rounded-xl shadow-xl overflow-hidden">
                    {languages.map((l) => (
                      <div 
                        key={l.code}
                        onClick={() => setLanguage(l.code)}
                        className={`px-4 py-2 hover:bg-soft-50 cursor-pointer flex items-center justify-between ${language === l.code ? 'text-accent font-semibold bg-soft-50' : 'text-soft-600'}`}
                      >
                        <span>{l.label}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
            
            <span className="hidden lg:flex items-center hover:text-accent transition-colors"><Brain size={16} className="mr-2"/> {t.psychology}</span>
            <span className="hidden lg:flex items-center hover:text-accent transition-colors"><Activity size={16} className="mr-2"/> {t.intentions}</span>
            <span className="hidden md:block px-3 py-1 bg-soft-100 rounded-full text-xs">{t.version}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {errorMsg && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center animate-fade-in">
            <AlertTriangle className="mr-3 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {state === AppState.IDLE && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-soft-200 shadow-sm text-sm text-soft-600 mb-4">
                <Sparkles size={16} className="mr-2 text-yellow-500" />
                <span>{t.heroBadge}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-soft-900 leading-tight">
                {t.heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-soft-500 leading-relaxed max-w-2xl mx-auto">
                {t.heroSubtitle}
              </p>
            </div>
            <VideoUploader 
              onFileSelect={handleFileSelect} 
              language={language} 
            />
            
            {/* Feature Pills */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl opacity-80">
              {t.features.map((feature, i) => (
                <div key={i} className="flex items-center justify-center p-4 bg-white rounded-xl border border-soft-200 text-soft-600 text-sm font-medium hover:border-accent hover:text-accent transition-colors cursor-default shadow-sm">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
             <div className="relative mb-8">
               <div className="w-28 h-28 border-4 border-soft-200 border-t-accent rounded-full animate-spin"></div>
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                 <Brain className="text-soft-400 animate-pulse" size={36} />
               </div>
             </div>
             
             <div className="w-full max-w-md space-y-4 text-center">
               <h2 className="text-2xl font-semibold text-soft-800">{loadingText}</h2>
               
               <div className="relative w-full h-3 bg-soft-200 rounded-full overflow-hidden">
                 <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                 ></div>
               </div>
               <p className="text-sm text-soft-500 font-medium">{progress}%</p>
             </div>
          </div>
        )}

        {state === AppState.REPORT && report && videoUrl && videoContent && (
          <div className="space-y-12 animate-fade-in pb-20">
            {/* 1. Navigation / Breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm text-soft-500">
              <span className="cursor-pointer hover:text-accent" onClick={handleReset}>{t.home}</span>
              <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : ''} />
              <span className="font-semibold text-soft-800">{t.reportTitle}</span>
            </div>

            {/* 2. Video Player - Top of page */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative group w-full mx-auto aspect-video">
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-contain mx-auto"
              />
            </div>

            {/* 3. Analysis Report Sections */}
            <AnalysisReportView report={report} language={language} />

            {/* 4. Chat Assistant - Bottom of page */}
            <div className="border-t border-soft-200 pt-10">
              <h3 className="text-2xl font-bold text-soft-800 mb-6 flex items-center">
                 <Brain className="mr-3 text-accent" />
                 {language === 'zh-TW' ? '行為分析助理' : 
                  language === 'zh-CN' ? '行为分析助理' :
                  language === 'ja' ? '行動分析アシスタント' : 
                  'Behavioral Assistant'}
              </h3>
              <ChatInterface videoContent={videoContent} language={language} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;
