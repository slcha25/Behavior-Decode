
import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft, CreditCard, Loader2, CheckCircle2, Globe } from 'lucide-react';
import { UserPlan, Language } from '../types';

interface StripeSimulationProps {
  plan: UserPlan;
  language: Language;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripeSimulation: React.FC<StripeSimulationProps> = ({ plan, language, onSuccess, onCancel }) => {
  const [step, setStep] = useState<'loading' | 'form' | 'processing' | 'success'>('loading');
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
    country: 'United States'
  });

  useEffect(() => {
    const timer = setTimeout(() => setStep('form'), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2500);
  };

  const planInfo = {
    basic: { name: 'Basic Plan (One-Time)', price: '$5.00' },
    premium: { name: 'Premium Plan (Monthly)', price: '$15.00' },
    free: { name: 'Free', price: '$0' }
  };

  const countries = [
    "United States", "Taiwan", "China", "Japan", "South Korea", "United Kingdom", "Canada", "Australia", 
    "Germany", "France", "Spain", "Italy", "Brazil", "Mexico", "India", "Singapore", "Hong Kong"
  ].sort();

  const getInputClass = (val: string) => {
    const base = "w-full rounded-lg px-4 py-2.5 outline-none transition-all duration-300 border font-medium text-sm ";
    if (val.length > 0) {
      return base + "bg-soft-700 border-soft-600 text-white placeholder:text-soft-400 focus:ring-2 focus:ring-accent/50";
    }
    return base + "bg-white border-soft-200 text-accent placeholder:text-soft-300 focus:border-accent focus:ring-2 focus:ring-accent/20";
  };

  if (step === 'loading') {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-accent mb-4" size={48} />
        <p className="text-gray-500 font-medium">Redirecting to checkout...</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-green-50 p-6 rounded-full mb-6">
          <CheckCircle2 className="text-green-500" size={64} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
        <p className="text-gray-500">Redirecting you back...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#f6f9fc] flex flex-col md:flex-row overflow-y-auto animate-fade-in custom-scrollbar">
      {/* Left Side: Summary */}
      <div className="w-full md:w-5/12 p-6 md:p-12 lg:p-16 flex flex-col bg-white md:bg-transparent md:sticky md:top-0 md:h-screen flex-shrink-0">
        <button onClick={onCancel} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-8 w-fit">
          <ArrowLeft size={18} className="mr-2" />
          <span className="font-medium text-sm">Back</span>
        </button>
        
        <div className="space-y-4">
          <p className="text-soft-500 font-bold uppercase tracking-widest text-[10px]">Subscribe to</p>
          <h1 className="text-xl md:text-3xl font-black text-soft-900 leading-tight">{planInfo[plan as keyof typeof planInfo].name}</h1>
          <div className="flex items-baseline space-x-1 pt-2">
            <span className="text-2xl md:text-4xl font-black text-soft-900">{planInfo[plan as keyof typeof planInfo].price}</span>
            {plan === 'premium' && <span className="text-soft-500 text-base">per month</span>}
          </div>
          
          <div className="mt-6 space-y-2 pt-6 border-t border-soft-200">
             <div className="flex justify-between text-xs text-soft-600">
               <span>Subtotal</span>
               <span>{planInfo[plan as keyof typeof planInfo].price}</span>
             </div>
             <div className="flex justify-between text-base font-bold text-soft-900 pt-2">
               <span>Total due today</span>
               <span>{planInfo[plan as keyof typeof planInfo].price}</span>
             </div>
          </div>
        </div>

        <div className="mt-auto pt-12 hidden md:flex items-center text-soft-400 text-[10px] font-medium">
          <span>Powered by</span>
          <div className="ml-2 font-black italic text-base tracking-tighter text-[#635bff]">stripe</div>
        </div>
      </div>

      {/* Right Side: Form Card */}
      <div className="w-full md:w-7/12 flex flex-col items-center justify-start md:justify-center p-4 md:p-10 min-h-screen md:min-h-0 bg-white md:bg-soft-50/10">
        <div className="w-full max-w-md bg-white border border-soft-200 p-8 rounded-[2rem] shadow-xl shadow-soft-300/10 my-4">
          <h2 className="text-lg font-bold text-soft-900 mb-6 flex items-center">
            <CreditCard className="mr-3 text-accent" size={20} />
            Payment method
          </h2>
          
          <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-soft-500 uppercase tracking-wider ml-1">Email</label>
              <input 
                type="email" 
                required 
                placeholder="user@example.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={getInputClass(formData.email)} 
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-soft-500 uppercase tracking-wider ml-1">Card information</label>
              <div className="space-y-2">
                <div className="relative">
                  <input type="text" required placeholder="1234 5678 1234 5678" className={getInputClass(formData.cardNumber)} />
                  <CreditCard size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-soft-300" />
                </div>
                <div className="flex gap-2">
                  <input type="text" required placeholder="MM / YY" className={getInputClass(formData.expiry)} />
                  <input type="text" required placeholder="CVC" className={getInputClass(formData.cvc)} />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-soft-500 uppercase tracking-wider ml-1">Cardholder name</label>
              <input type="text" required placeholder="Full name on card" className={getInputClass(formData.name)} />
            </div>

            <div className="space-y-1 pb-2">
              <label className="block text-[10px] font-bold text-soft-500 uppercase tracking-wider ml-1">Country</label>
              <select className={getInputClass(formData.country)}>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button type="submit" disabled={step === 'processing'} className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-accent/20 disabled:opacity-70 mt-4 active:scale-95">
              {step === 'processing' ? <Loader2 className="animate-spin mr-2" /> : <Lock className="mr-2" size={16} />}
              <span>Pay {planInfo[plan as keyof typeof planInfo].price}</span>
            </button>
            <p className="text-[9px] text-soft-400 text-center px-4 mt-4 leading-relaxed">Secure transaction. By clicking Pay, you agree to our Terms of Service.</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StripeSimulation;
