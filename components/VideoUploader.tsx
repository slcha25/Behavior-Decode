
import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, FileVideo, HardDrive } from 'lucide-react';
import { Language } from '../types';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  language: Language;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTexts = (lang: Language) => {
    const base = {
      title: 'Upload Video for Analysis',
      subtitle: 'Drag & drop or click to browse',
      format: 'MP4, MOV, WEBM',
      limit: 'Max size: 50MB',
      errorType: 'Please upload a valid video file.',
      errorSize: 'For reliable browser analysis, please use files under 50MB.',
    };

    switch (lang) {
      case 'zh-TW': return { ...base, title: '上傳影片進行分析', subtitle: '拖放或點擊瀏覽', format: 'MP4, MOV, WEBM', limit: '檔案上限: 50MB', errorType: '請上傳有效的影片檔案。', errorSize: '為確保瀏覽器分析順利，建議使用 50MB 以下的檔案。' };
      case 'zh-CN': return { ...base, title: '上传视频进行分析', subtitle: '拖放或点击浏览', format: 'MP4, MOV, WEBM', limit: '文件上限: 50MB', errorType: '请上传有效的视频文件。', errorSize: '为确保浏览器分析顺利，建议使用 50MB 以下的文件。' };
      case 'ja': return { ...base, title: '分析する動画をアップロード', subtitle: 'ドラッグ＆ドロップまたはクリック', format: 'MP4, MOV, WEBM', limit: '最大サイズ: 50MB', errorType: '有効な動画ファイルをアップロードしてください。', errorSize: 'ブラウザでの安定した分析のため、50MB以下のファイルを推奨します。' };
      case 'ko': return { ...base, title: '분석할 비디오 업로드', subtitle: '드래그 앤 드롭 또는 클릭', format: 'MP4, MOV, WEBM', limit: '최대 크기: 50MB', errorType: '유효한 비디오 파일을 업로드하세요.', errorSize: '안정적인 브라우저 분석을 위해 50MB 미만의 파일을 권장합니다.' };
      case 'es': return { ...base, title: 'Subir video para análisis', subtitle: 'Arrastrar y soltar o clic', format: 'MP4, MOV, WEBM', limit: 'Máx: 50MB', errorType: 'Sube un archivo de video válido.', errorSize: 'Recomendado menos de 50MB para análisis en navegador.' };
      case 'fr': return { ...base, title: 'Télécharger la vidéo', subtitle: 'Glisser-déposer ou cliquer', format: 'MP4, MOV, WEBM', limit: 'Max: 50 Mo', errorType: 'Veuillez télécharger un fichier valide.', errorSize: 'Moins de 50 Mo recommandé pour le navigateur.' };
      case 'ru': return { ...base, title: 'Загрузить видео', subtitle: 'Перетащите или нажмите', format: 'MP4, MOV, WEBM', limit: 'Макс: 50 МБ', errorType: 'Загрузите корректный файл.', errorSize: 'Для браузера рекомендуется файл < 50 МБ.' };
      case 'ar': return { ...base, title: 'رفع الفيديو للتحليل', subtitle: 'اسحب وأفلت أو انقر للتصفح', format: 'MP4, MOV, WEBM', limit: 'الحد الأقصى: 50 ميجابايت', errorType: 'يرجى رفع ملف فيديو صالح.', errorSize: 'لتحليل موثوق في المتصفح، يرجى استخدام ملفات أقل من 50 ميجابايت.' };
      default: return base;
    }
  };

  const t = getTexts(language);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndPassFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError(t.errorType);
      return;
    }
    // Warn about browser limits if very large
    if (file.size > 50 * 1024 * 1024) {
      setError(t.errorSize);
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const triggerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative group flex flex-col items-center justify-center w-full h-80 rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer overflow-hidden animate-fade-in
          ${dragActive ? 'border-accent bg-accent-light/20 scale-[1.02]' : 'border-soft-300 bg-white hover:border-accent hover:bg-soft-50'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerClick}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="video/*" 
          onChange={handleChange} 
        />
        
        <div className="z-10 flex flex-col items-center text-center p-6 space-y-4">
          <div className={`p-5 rounded-full transition-colors duration-300 ${dragActive ? 'bg-accent text-white' : 'bg-soft-100 text-soft-500 group-hover:bg-accent group-hover:text-white'}`}>
            <Upload size={36} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-soft-800">{t.title}</h3>
            <p className="text-soft-500 mt-2 text-sm">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className="flex items-center space-x-2 text-xs text-soft-400 bg-soft-100 px-3 py-1 rounded-full">
               <FileVideo size={14} />
               <span>{t.format}</span>
             </div>
             <div className="flex items-center space-x-2 text-xs text-soft-500 bg-soft-100 px-3 py-1 rounded-full font-medium">
               <HardDrive size={14} />
               <span>{t.limit}</span>
             </div>
          </div>
        </div>

        {/* Decorative background blobs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-light rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>
      
      {error && (
        <div className="mt-4 flex items-center p-4 text-sm text-amber-800 border border-amber-200 rounded-xl bg-amber-50 animate-fade-in">
          <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
