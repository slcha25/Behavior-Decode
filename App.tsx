
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AppState, AnalysisReport, Language, UsageState, User } from './types';
import VideoUploader from './components/VideoUploader';
import AnalysisReportView from './components/AnalysisReport';
import ChatInterface from './components/ChatInterface';
import PricingModal from './components/PricingModal';
import UserProfile from './components/UserProfile';
import AccountDetails from './components/AccountDetails';
import AnalysisHistory from './components/AnalysisHistory';
import AuthPage from './components/AuthPage';
import { analyzeVideoBehavior } from './services/geminiService';
import { getUsage, deductCredit, isLimitReached, getHistory, saveToHistory } from './services/usageService';
import { getCurrentUser, logoutUser } from './services/authService';
import { Scan, Brain, Sparkles, ChevronRight, Activity, Globe, AlertTriangle, CreditCard, LogOut, User as UserIcon, UserCircle } from 'lucide-react';

interface VideoContent {
  inlineData?: { mimeType: string; data: string };
  fileData?: { fileUri: string; mimeType: string };
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [language, setLanguage] = useState<Language>('en');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoContent, setVideoContent] = useState<VideoContent | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisReport[]>(getHistory());
  const [loadingText, setLoadingText] = useState("Initializing...");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageState>(getUsage());
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    setAnalysisHistory(getHistory());
    setUsage(getUsage());
  }, [currentUser]);

  const getTexts = (lang: Language) => {
    const translations: Record<Language, any> = {
      'en': {
        title: "BehaviorDecode", logout: 'Logout', credits: 'Credits Left', heroBadge: 'Powered by Gemini AI',
        heroTitle: <>Understand the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">Why</span> behind the action.</>,
        heroSubtitle: 'Upload a video to decode character personality, hidden intentions, and emotional drivers using advanced psychological profiling.',
        features: ['Micro-expressions', 'Tone Analysis', 'Posture Reading', 'Motivation'],
        consulting: 'Consulting behavioral models...', home: 'Home', reportTitle: 'Analysis Report',
        error: 'Analysis failed.', limitReached: 'No credits left. Please sign up or upgrade.', userAccount: 'User Account', signIn: 'Sign In', signUp: 'Sign Up', profile: 'My Profile'
      },
      'zh-TW': {
        title: "BehaviorDecode", logout: '登出', credits: '剩餘點數', heroBadge: '由 Gemini AI 驅動',
        heroTitle: <>瞭解行動背後的<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">真相</span></>,
        heroSubtitle: '上傳影片以運用先進的心理分析，解讀人物性格、隱藏意圖和情緒驅動力。',
        features: ['微表情', '語氣分析', '姿態解讀', '行為動機'],
        consulting: '正在根據心理學理論分析...', home: '首頁', reportTitle: '分析報告',
        error: '分析失敗。', limitReached: '點數已用完，請登入或升級方案。', userAccount: '用戶帳戶', signIn: '登入', signUp: '註冊', profile: '個人檔案'
      },
      'zh-CN': {
        title: "BehaviorDecode", logout: '登出', credits: '剩余点数', heroBadge: '由 Gemini AI 驱动',
        heroTitle: <>了解行动背后的<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">真相</span></>,
        heroSubtitle: '上传视频以运用先进的心理分析，解读人物性格、隐藏意图和情绪驱动力。',
        features: ['微表情', '语气分析', '姿态解读', '行为动机'],
        consulting: '正在根据心理学理论分析...', home: '首页', reportTitle: '分析报告',
        error: '分析失败。', limitReached: '点数已用完，请登录或升级方案。', userAccount: '用户账户', signIn: '登录', signUp: '注册', profile: '个人档案'
      },
      'ja': {
        title: "BehaviorDecode", logout: 'ログアウト', credits: '残りクレジット', heroBadge: 'Gemini AI 搭載',
        heroTitle: <>行動の背後にある<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">理由</span>を理解する</>,
        heroSubtitle: '動画をアップロードして、高度な心理プロファイリングを使用してキャラクターの性格、隠された意図、感情的な動機を解読します。',
        features: ['微表情', 'トーン分析', '姿勢の読み取り', '動機分析'],
        consulting: '行動モデルをコンサルティング中...', home: 'ホーム', reportTitle: '分析レポート',
        error: '分析に失敗しました。', limitReached: 'クレジットがありません。登録またはアップグレードしてください。', userAccount: 'ユーザーアカウント', signIn: 'サインイン', signUp: 'サインアップ', profile: 'プロフィール'
      },
      'ko': {
        title: "BehaviorDecode", logout: '로그아웃', credits: '남은 크레딧', heroBadge: 'Gemini AI 기반',
        heroTitle: <>행동 뒤에 숨겨진 <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">이유</span>를 이해하십시오.</>,
        heroSubtitle: '비디오를 업로드하여 고급 심리 프로파일링을 사용하여 캐릭터의 성격, 숨겨진 의도 및 감정적 동인을 해독하십시오.',
        features: ['미세 표정', '어조 분석', '자세 읽기', '동기 부여'],
        consulting: '행동 모델 컨설팅 중...', home: '홈', reportTitle: '분석 보고서',
        error: '분석 실패.', limitReached: '크레딧이 부족합니다. 가입 또는 업그레이드하세요.', userAccount: '사용자 계정', signIn: '로그인', signUp: '가입하기', profile: '프로필'
      },
      'es': {
        title: "BehaviorDecode", logout: 'Cerrar sesión', credits: 'Créditos restantes', heroBadge: 'Impulsado por Gemini AI',
        heroTitle: <>Comprenda el <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">porqué</span> de la acción.</>,
        heroSubtitle: 'Sube un video para decodificar la personalidad, intenciones ocultas y motores emocionales utilizando perfiles psicológicos avanzados.',
        features: ['Microexpresiones', 'Análisis de tono', 'Lectura de postura', 'Motivación'],
        consulting: 'Consultando modelos conductuales...', home: 'Inicio', reportTitle: 'Informe de análisis',
        error: 'Error en el análisis.', limitReached: 'Sin créditos. Regístrese o actualice.', userAccount: 'Cuenta de usuario', signIn: 'Iniciar sesión', signUp: 'Registrarse', profile: 'Mi perfil'
      },
      'fr': {
        title: "BehaviorDecode", logout: 'Déconnexion', credits: 'Crédits restants', heroBadge: 'Propulsé par Gemini AI',
        heroTitle: <>Comprenez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">pourquoi</span> de l'action.</>,
        heroSubtitle: 'Téléchargez une vidéo pour décoder la personnalité, les intentions cachées et les moteurs émotionnels à l\'aide d\'un profilage psychologique avancé.',
        features: ['Micro-expressions', 'Analyse du ton', 'Lecture de posture', 'Motivation'],
        consulting: 'Consultation des modèles...', home: 'Accueil', reportTitle: 'Rapport d\'analyse',
        error: 'Échec de l\'analyse.', limitReached: 'Plus de crédits. Inscrivez-vous ou passez au niveau supérieur.', userAccount: 'Compte utilisateur', signIn: 'Connexion', signUp: 'Inscription', profile: 'Mon profil'
      },
      'ru': {
        title: "BehaviorDecode", logout: 'Выйти', credits: 'Осталось кредитов', heroBadge: 'На базе Gemini AI',
        heroTitle: <>Поймите <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">почему</span> совершается действие.</>,
        heroSubtitle: 'Загрузите видео, чтобы расшифровать личность, скрытые намерения и эмоциональные драйверы с помощью расширенного психологического профилирования.',
        features: ['Микровыражения', 'Анализ тона', 'Чтение поз', 'Мотивация'],
        consulting: 'Консультация поведенческих моделей...', home: 'Главная', reportTitle: 'Отчет об анализе',
        error: 'Анализ не удался.', limitReached: 'Нет кредитов. Зарегистрируйтесь или обновите.', userAccount: 'Аккаунт', signIn: 'Войти', signUp: 'Регистрация', profile: 'Мой профиль'
      },
      'ar': {
        title: "BehaviorDecode", logout: 'تسجيل الخروج', credits: 'الرصيد المتبقي', heroBadge: 'مدعوم بـ Gemini AI',
        heroTitle: <>افهم <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">السبب</span> وراء الفعل.</>,
        heroSubtitle: 'ارفع فيديو لفك تشفير الشخصية، والنوايا الخفية، والمحركات العاطفية باستخدام التحليل النفسي المتقدم.',
        features: ['تعبيرات دقيقة', 'تحليل النبرة', 'قراءة الوضعية', 'الدوافع'],
        consulting: 'استشارة النماذج السلوكية...', home: 'الرئيسية', reportTitle: 'تقرير التحليل',
        error: 'فشل التحليل.', limitReached: 'لا يوجد رصيد. يرجى الاشتراك أو الترقية.', userAccount: 'حساب المستخدم', signIn: 'تسجيل الدخول', signUp: 'اشتراك', profile: 'ملفي الشخصي'
      }
    };
    return translations[lang] || translations['en'];
  };

  const t = getTexts(language);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setUsage(getUsage());
    setAnalysisHistory(getHistory());
    setShowAuthModal(false);
    setShowUserMenu(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    handleReset();
    setShowUserMenu(false);
  };

  const handleFileSelect = async (file: File) => {
    if (isLimitReached()) {
      if (!currentUser) setShowAuthModal(true);
      else setIsPricingOpen(true);
      setErrorMsg(t.limitReached);
      return;
    }
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
      const success = deductCredit();
      if (!success) throw new Error(t.limitReached);
      const finalReport = {
        ...result.report,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        videoName: file.name
      };
      setReport(finalReport);
      saveToHistory(finalReport);
      setAnalysisHistory(getHistory());
      setVideoContent(result.videoContent);
      setState(AppState.REPORT);
      setUsage(getUsage());
    } catch (error: any) {
      console.error("Process failed", error);
      setState(AppState.IDLE);
      setErrorMsg(`${t.error} ${error.message}`);
      if (videoUrl) { URL.revokeObjectURL(videoUrl); setVideoUrl(null); }
    }
  };

  const handleReset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setState(AppState.IDLE);
    setVideoFile(null);
    setVideoUrl(null);
    setVideoContent(null);
    setReport(null);
    setErrorMsg(null);
    setProgress(0);
    setUsage(getUsage());
  };

  // Fix: Implemented handleSelectHistoricalReport to allow viewing previously analyzed reports from history
  const handleSelectHistoricalReport = (selectedReport: AnalysisReport) => {
    setReport(selectedReport);
    // History storage only includes report text, so we reset video playback and chat context
    setVideoUrl(null);
    setVideoContent(null);
    setState(AppState.REPORT);
  };

  return (
    <div className={`min-h-screen bg-soft-50 font-sans text-soft-900 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-soft-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleReset}>
            <div className="bg-accent text-white p-2 rounded-xl shadow-lg shadow-accent/30">
              <Scan size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-soft-800 hidden md:inline">Behavior<span className="text-accent">Decode</span></span>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6 text-sm font-medium text-soft-500">
            <div onClick={() => setIsPricingOpen(true)} className="flex items-center space-x-2 bg-accent/5 border border-accent/10 px-4 py-2 rounded-full cursor-pointer hover:bg-accent/10 transition-all">
              <CreditCard size={14} className="text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                {usage.creditsRemaining} {t.credits}
              </span>
            </div>
            <div className="relative group flex items-center">
              <button className="flex items-center hover:text-accent transition-colors px-3 py-1 bg-soft-50 rounded-full border border-soft-100">
                <Globe size={16} className="mr-2" />
                <span className="uppercase text-xs font-bold">{language}</span>
              </button>
              <div className="absolute right-0 top-full pt-4 w-48 hidden group-hover:block z-50 animate-fade-in">
                 <div className="bg-white border border-soft-200 rounded-2xl shadow-2xl overflow-hidden py-1">
                    {['en', 'zh-TW', 'zh-CN', 'ja', 'ko', 'es', 'fr', 'ru', 'ar'].map(lang => (
                      <div key={lang} onClick={() => setLanguage(lang as Language)} 
                        className={`px-4 py-2.5 hover:bg-soft-50 cursor-pointer transition-colors text-sm flex items-center justify-between ${language === lang ? 'text-accent font-bold bg-accent/5' : 'text-soft-600'}`}>
                        <span>{lang.toUpperCase()}</span>
                        {language === lang && <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>}
                      </div>
                    ))}
                 </div>
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 bg-soft-100 p-1.5 pr-4 rounded-full hover:bg-soft-200 transition-all">
                {currentUser ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs uppercase shadow-md shadow-accent/20">
                      {currentUser.name[0]}
                    </div>
                    <span className="hidden sm:inline font-semibold text-soft-700">{currentUser.name}</span>
                  </>
                ) : (
                  <>
                    <UserCircle size={20} className="text-soft-500" />
                    <span className="hidden sm:inline font-semibold text-soft-700">{t.userAccount}</span>
                  </>
                )}
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-soft-200 rounded-2xl shadow-2xl z-20 overflow-hidden animate-fade-in">
                    {currentUser ? (
                      <>
                        <div className="p-4 border-b border-soft-100">
                          <p className="text-xs font-bold text-soft-400 uppercase mb-1">Signed in as</p>
                          <p className="text-sm font-semibold truncate text-soft-800">{currentUser.email}</p>
                        </div>
                        <button onClick={() => {setState(AppState.PROFILE); setShowUserMenu(false);}} className="w-full px-4 py-3.5 flex items-center space-x-3 text-soft-700 hover:bg-soft-50 transition-colors text-sm font-medium">
                          <UserIcon size={16} className="text-soft-400" />
                          <span>{t.profile}</span>
                        </button>
                        <button onClick={handleLogout} className="w-full px-4 py-3.5 flex items-center space-x-3 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium">
                          <LogOut size={16} />
                          <span>{t.logout}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => {setShowAuthModal(true); setShowUserMenu(false);}} className="w-full px-4 py-3.5 flex items-center space-x-3 text-soft-700 hover:bg-soft-50 transition-colors text-sm font-semibold border-b border-soft-100">
                          <LogOut size={16} className="rotate-180 text-soft-400" />
                          <span>{t.signIn}</span>
                        </button>
                        <button onClick={() => {setShowAuthModal(true); setShowUserMenu(false);}} className="w-full px-4 py-3.5 flex items-center space-x-3 text-accent hover:bg-accent/5 transition-colors text-sm font-bold">
                          <Sparkles size={16} />
                          <span>{t.signUp}</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {errorMsg && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center animate-fade-in">
            <AlertTriangle className="mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
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
            <VideoUploader onFileSelect={handleFileSelect} language={language} />
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl opacity-80">
              {t.features.map((feature: string, i: number) => (
                <div key={i} className="flex items-center justify-center p-4 bg-white rounded-xl border border-soft-200 text-soft-600 text-sm font-medium hover:border-accent transition-colors cursor-default shadow-sm">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
        {state === AppState.PROFILE && currentUser && (
           <UserProfile user={currentUser} usage={usage} language={language} onAddCredits={() => setIsPricingOpen(true)} onViewAccountDetails={() => setState(AppState.ACCOUNT_DETAILS)} onViewHistory={() => setState(AppState.HISTORY)} onBack={handleReset} />
        )}
        {state === AppState.ACCOUNT_DETAILS && currentUser && (
          <AccountDetails user={currentUser} usage={usage} language={language} onUpdateSuccess={handleUpdateUser} onBack={() => setState(AppState.PROFILE)} />
        )}
        {state === AppState.HISTORY && (
          <AnalysisHistory history={analysisHistory} language={language} onSelectReport={handleSelectHistoricalReport} onBack={() => setState(AppState.PROFILE)} />
        )}
        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
             <div className="relative mb-8"><div className="w-28 h-28 border-4 border-soft-200 border-t-accent rounded-full animate-spin"></div><div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><Brain className="text-soft-400 animate-pulse" size={36} /></div></div>
             <div className="w-full max-w-md space-y-4 text-center"><h2 className="text-2xl font-semibold text-soft-800">{loadingText}</h2><div className="relative w-full h-3 bg-soft-200 rounded-full overflow-hidden"><div className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }}></div></div><p className="text-sm text-soft-500 font-medium">{progress}%</p></div>
          </div>
        )}
        {state === AppState.REPORT && report && (
          <div className="space-y-12 animate-fade-in pb-20">
            <div className="flex items-center justify-between"><div className="flex items-center space-x-2 text-sm text-soft-500"><span className="cursor-pointer hover:text-accent" onClick={handleReset}>{t.home}</span><ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : ''} /><span className="font-semibold text-soft-800">{t.reportTitle}</span></div></div>
            {videoUrl && <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative group w-full mx-auto aspect-video"><video src={videoUrl} controls className="w-full h-full object-contain mx-auto" /></div>}
            <AnalysisReportView report={report} language={language} />
            {videoContent && <div className="border-t border-soft-200 pt-10"><h3 className="text-2xl font-bold text-soft-800 mb-6 flex items-center"><Brain className="mr-3 text-accent" />Behavioral Pattern Analysis</h3><ChatInterface videoContent={videoContent} language={language} /></div>}
          </div>
        )}
      </main>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} language={language} onSuccess={() => { setUsage(getUsage()); setErrorMsg(null); }} onPromptLogin={() => { setIsPricingOpen(false); setShowAuthModal(true); }} isLoggedIn={!!currentUser} />
      {showAuthModal && <AuthPage onAuthSuccess={handleAuthSuccess} onClose={() => setShowAuthModal(false)} language={language} />}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(<React.StrictMode><App /></React.StrictMode>);
export default App;
