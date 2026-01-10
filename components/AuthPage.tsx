
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, Scan, X } from 'lucide-react';
import { loginUser, registerUser } from '../services/authService';
import { Language, User as UserType } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: UserType) => void;
  onClose?: () => void;
  language: Language;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onClose, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const user = await loginUser(email, password);
        onAuthSuccess(user);
      } else {
        const user = await registerUser(email, password, name);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    welcome: language === 'zh-TW' ? '歡迎回到 BehaviorDecode' : 'Welcome to BehaviorDecode',
    create: language === 'zh-TW' ? '建立您的帳戶' : 'Create your account',
    subtitle: language === 'zh-TW' ? '開始解讀行為背後的心理真相' : 'Start decoding the psychology behind actions.',
    email: language === 'zh-TW' ? '電子郵件' : 'Email Address',
    pass: language === 'zh-TW' ? '密碼' : 'Password',
    name: language === 'zh-TW' ? '姓名' : 'Full Name',
    btn: isLogin ? (language === 'zh-TW' ? '登入' : 'Sign In') : (language === 'zh-TW' ? '註冊' : 'Sign Up'),
    switch: isLogin 
      ? (language === 'zh-TW' ? '還沒有帳戶？立即註冊' : "Don't have an account? Sign up") 
      : (language === 'zh-TW' ? '已有帳戶？立即登入' : 'Already have an account? Sign in')
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-soft-900/90 backdrop-blur-md p-6 overflow-y-auto">
      <div className="max-w-md w-full animate-fade-in-up relative py-12">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-accent text-white p-2.5 rounded-2xl shadow-xl shadow-accent/30 mb-3">
            <Scan size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Behavior<span className="text-accent">Decode</span></h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-soft-200 relative">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-soft-400 hover:text-soft-800 transition-colors bg-soft-50 rounded-full hover:bg-soft-100"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          )}

          <div className="mb-8 pr-8">
            <h2 className="text-2xl font-black text-soft-800 mb-2">{isLogin ? t.welcome : t.create}</h2>
            <p className="text-soft-500 text-sm">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-soft-600 uppercase tracking-widest block ml-1">{t.name}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-400" size={18} />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe" 
                    className="w-full bg-soft-50 border border-soft-200 rounded-xl px-12 py-3.5 focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-soft-600 uppercase tracking-widest block ml-1">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-400" size={18} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@email.com" 
                  className="w-full bg-soft-50 border border-soft-200 rounded-xl px-12 py-3.5 focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-soft-600 uppercase tracking-widest block ml-1">{t.pass}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-400" size={18} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-soft-50 border border-soft-200 rounded-xl px-12 py-3.5 focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold ml-1 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 mt-4 overflow-hidden group relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              {loading ? <Loader2 className="animate-spin" size={22} /> : <><span>{t.btn}</span> <ArrowRight size={20} /></>}
            </button>
          </form>

          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="w-full text-center text-soft-400 text-xs mt-8 hover:text-accent transition-colors font-bold tracking-tight"
          >
            {t.switch}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
