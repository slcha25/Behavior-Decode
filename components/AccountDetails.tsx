
import React, { useState } from 'react';
import { User, UsageState, Language } from '../types';
import { Mail, Phone, User as UserIcon, Lock, ChevronLeft, Save, RefreshCw, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { updateUserProfile, changePassword } from '../services/authService';

interface AccountDetailsProps {
  user: User;
  usage: UsageState;
  language: Language;
  onBack: () => void;
  onUpdateSuccess: (updatedUser: User) => void;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ user, usage, language, onBack, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    email: user.email
  });
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showToast, setShowToast] = useState<'update' | 'reset' | 'error' | null>(null);
  const [errorText, setErrorText] = useState('');

  const getTexts = (lang: Language) => {
    const translations: Record<Language, any> = {
      'en': { title: 'Account Details', firstName: 'First Name', lastName: 'Last Name', email: 'Email', phone: 'Phone', password: 'Password', resetPass: 'Update Password', update: 'Update Profile', success: 'Updated!', resetSuccess: 'Password Changed', newPass: 'New Password', confirmPass: 'Confirm New Password', passMismatch: 'Passwords do not match' },
      'zh-TW': { title: '帳戶詳細資訊', firstName: '名字', lastName: '姓氏', email: '電子郵件', phone: '電話號碼', password: '密碼', resetPass: '更新密碼', update: '更新個人資料', success: '更新成功！', resetSuccess: '密碼已更新', newPass: '新密碼', confirmPass: '確認新密碼', passMismatch: '密碼不相符' },
      'zh-CN': { title: '账户详细信息', firstName: '名字', lastName: '姓氏', email: '电子邮箱', phone: '电话号码', password: '密码', resetPass: '更新密码', update: '更新个人资料', success: '更新成功！', resetSuccess: '密码已更新', newPass: '新密码', confirmPass: '确认新密码', passMismatch: '密码不相符' },
      'ja': { title: 'アカウント詳細', firstName: '名前', lastName: '苗字', email: 'メール', phone: '電話番号', password: 'パスワード', resetPass: '更新', update: '保存', success: '保存完了', resetSuccess: '更新完了', newPass: '新パスワード', confirmPass: '確認', passMismatch: '不一致' },
      'ko': { title: '계정 정보', firstName: '이름', lastName: '성', email: '이메일', phone: '전화', password: '비밀번호', resetPass: '비밀번호 변경', update: '정보 수정', success: '수정됨', resetSuccess: '변경됨', newPass: '새 비밀번호', confirmPass: '확인', passMismatch: '불일치' },
      'es': { title: 'Detalles de la cuenta', firstName: 'Nombre', lastName: 'Apellido', email: 'Email', phone: 'Teléfono', password: 'Clave', resetPass: 'Actualizar clave', update: 'Guardar', success: 'Guardado', resetSuccess: 'Clave cambiada', newPass: 'Nueva clave', confirmPass: 'Confirmar', passMismatch: 'No coinciden' },
      'fr': { title: 'Détails du compte', firstName: 'Prénom', lastName: 'Nom', email: 'Email', phone: 'Téléphone', password: 'Mot de passe', resetPass: 'Changer', update: 'Enregistrer', success: 'Enregistré', resetSuccess: 'C’est fait', newPass: 'Nouveau', confirmPass: 'Confirmer', passMismatch: 'Pas identiques' },
      'ru': { title: 'Детали аккаунта', firstName: 'Имя', lastName: 'Фамилия', email: 'Email', phone: 'Телефон', password: 'Пароль', resetPass: 'Сменить', update: 'Сохранить', success: 'Успешно', resetSuccess: 'Пароль изменен', newPass: 'Новый пароль', confirmPass: 'Подтверждение', passMismatch: 'Не совпадают' },
      'ar': { title: 'تفاصيل الحساب', firstName: 'الاسم الأول', lastName: 'الاسم الأخير', email: 'الايميل', phone: 'الهاتف', password: 'كلمة المرور', resetPass: 'تحديث', update: 'حفظ', success: 'تم التحديث', resetSuccess: 'تم التغيير', newPass: 'كلمة مرور جديدة', confirmPass: 'تأكيد', passMismatch: 'غير متطابق' }
    };
    return translations[lang] || translations['en'];
  };
  const t = getTexts(language);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updated = await updateUserProfile({ firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone });
      onUpdateSuccess(updated);
      setShowToast('update');
      setTimeout(() => setShowToast(null), 3000);
    } catch (e) { console.error(e); } finally { setIsUpdating(false); }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.newPassword || passwords.newPassword !== passwords.confirmPassword) {
      setErrorText(t.passMismatch); setShowToast('error'); setTimeout(() => setShowToast(null), 3000); return;
    }
    setIsResetting(true);
    try {
      await changePassword(user.email, passwords.newPassword);
      setPasswords({ newPassword: '', confirmPassword: '' });
      setShowToast('reset');
      setTimeout(() => setShowToast(null), 3000);
    } catch (e: any) { setErrorText(e.message); setShowToast('error'); } finally { setIsResetting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-8 pb-12">
      <div className="flex items-center justify-between"><div className="flex items-center space-x-4"><button onClick={onBack} className="p-2 hover:bg-soft-100 rounded-full transition-all text-soft-500"><ChevronLeft size={24} /></button><h2 className="text-2xl font-black text-soft-900">{t.title}</h2></div>
        {showToast && <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border animate-fade-in ${showToast === 'error' ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}><CheckCircle2 size={16} /><span className="text-sm font-bold">{showToast === 'update' ? t.success : showToast === 'reset' ? t.resetSuccess : errorText}</span></div>}
      </div>
      <div className="bg-white rounded-[2.5rem] border border-soft-200 shadow-xl overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5"><label className="text-[10px] font-bold text-soft-400 uppercase tracking-widest block ml-1">{t.firstName}</label><div className="relative"><UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" /><input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-soft-50 border border-soft-100 rounded-2xl px-12 py-4 font-semibold text-soft-800 outline-none focus:ring-2 focus:ring-accent/10 transition-all" /></div></div>
            <div className="space-y-1.5"><label className="text-[10px] font-bold text-soft-400 uppercase tracking-widest block ml-1">{t.lastName}</label><div className="relative"><UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" /><input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-soft-50 border border-soft-100 rounded-2xl px-12 py-4 font-semibold text-soft-800 outline-none focus:ring-2 focus:ring-accent/10 transition-all" /></div></div>
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5"><label className="text-[10px] font-bold text-soft-400 uppercase tracking-widest block ml-1">{t.email}</label><div className="relative opacity-60"><Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" /><input type="email" readOnly value={formData.email} className="w-full bg-soft-50 border border-soft-100 rounded-2xl px-12 py-4 font-semibold text-soft-800 cursor-not-allowed" /></div></div>
            <div className="space-y-1.5"><label className="text-[10px] font-bold text-soft-400 uppercase tracking-widest block ml-1">{t.phone}</label><div className="relative"><Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" /><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-soft-50 border border-soft-100 rounded-2xl px-12 py-4 font-semibold text-soft-800 outline-none focus:ring-2 focus:ring-accent/10 transition-all" /></div></div>
          </div>
          <div className="flex justify-end pt-4"><button onClick={handleUpdate} disabled={isUpdating} className="bg-accent hover:bg-accent-dark text-white px-10 py-4 rounded-2xl font-bold flex items-center space-x-2 shadow-xl shadow-accent/20 transition-all active:scale-95 disabled:opacity-50">{isUpdating ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}<span>{t.update}</span></button></div>
          <div className="pt-8 border-t border-soft-100 space-y-6"><h3 className="text-sm font-bold text-soft-800 uppercase tracking-widest flex items-center"><Lock size={16} className="mr-2 text-accent" />{t.password}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-soft-400 uppercase tracking-widest block ml-1">{t.newPass}</label><div className="relative"><Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" /><input type={showPass ? "text" : "password"} value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full bg-soft-50 border border-soft-100 rounded-2xl px-12 py-4 font-semibold text-soft-800 outline-none focus:ring-2 focus:ring-accent/10" /><button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-soft-400">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-soft-400 uppercase tracking-widest block ml-1">{t.confirmPass}</label><div className="relative"><Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" /><input type={showPass ? "text" : "password"} value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full bg-soft-50 border border-soft-100 rounded-2xl px-12 py-4 font-semibold text-soft-800 outline-none focus:ring-2 focus:ring-accent/10" /></div></div>
            </div>
            <div className="flex justify-end"><button onClick={handleUpdatePassword} disabled={isResetting || !passwords.newPassword} className="text-sm font-bold text-accent hover:text-white hover:bg-accent border-2 border-accent px-6 py-3 rounded-2xl transition-all flex items-center disabled:opacity-30">{isResetting ? <RefreshCw className="animate-spin mr-2" size={14} /> : t.resetPass}</button></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
