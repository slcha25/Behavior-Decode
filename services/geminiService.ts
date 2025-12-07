
import { GoogleGenAI } from "@google/genai";
import { AnalysisReport, Language, MBTIResult } from "../types";

// Initialize GenAI
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Base64 (for small files)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to clean JSON string
const cleanJSON = (text: string): string => {
  return text.replace(/```json\n?|\n?```/g, '').trim();
};

// Helper to determine mime type robustly
const getMimeType = (file: File): string => {
  if (file.type && file.type !== "") return file.type;
  
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4': return 'video/mp4';
    case 'mov': return 'video/quicktime';
    case 'webm': return 'video/webm';
    case 'avi': return 'video/x-msvideo';
    case 'mkv': return 'video/x-matroska';
    case 'wmv': return 'video/x-ms-wmv';
    case 'flv': return 'video/x-flv';
    default: return 'video/mp4'; // Fallback
  }
};

const getLanguageName = (lang: Language): string => {
  switch (lang) {
    case 'zh-TW': return 'Traditional Chinese (繁體中文)';
    case 'zh-CN': return 'Simplified Chinese (简体中文)';
    case 'ja': return 'Japanese (日本語)';
    case 'ko': return 'Korean (한국어)';
    case 'es': return 'Spanish (Español)';
    case 'fr': return 'French (Français)';
    case 'ru': return 'Russian (Русский)';
    case 'ar': return 'Arabic (العربية)';
    default: return 'English';
  }
};

// Upload file if large, otherwise return base64 for inline
interface VideoContent {
  inlineData?: { mimeType: string; data: string };
  fileData?: { fileUri: string; mimeType: string };
}

const getStatusMessages = (lang: Language) => {
  const msgs: Record<string, { encoding: string, uploading: string, processing: string, ready: string, failed: string, init: string, analyzing: string, complete: string, retry: string }> = {
    'en': { encoding: "Encoding video...", uploading: "Uploading video to cloud...", processing: "Processing video on cloud...", ready: "Video ready...", failed: "Video processing failed.", init: "Initializing...", analyzing: "Gemini is analyzing behavior patterns...", complete: "Analysis complete!", retry: "Retrying analysis..." },
    'zh-TW': { encoding: "正在編碼影片...", uploading: "正在上傳影片至雲端...", processing: "雲端正在處理影片...", ready: "影片準備就緒...", failed: "影片處理失敗。", init: "初始化...", analyzing: "Gemini 正在分析行為模式...", complete: "分析完成！", retry: "重試中..." },
    'zh-CN': { encoding: "正在编码视频...", uploading: "正在上传视频至云端...", processing: "云端正在处理视频...", ready: "视频准备就绪...", failed: "视频处理失败。", init: "初始化...", analyzing: "Gemini 正在分析行为模式...", complete: "分析完成！", retry: "重试中..." },
    'ja': { encoding: "動画をエンコード中...", uploading: "クラウドにアップロード中...", processing: "クラウドで処理中...", ready: "動画の準備完了...", failed: "動画の処理に失敗しました。", init: "初期化中...", analyzing: "Geminiが行動パターンを分析中...", complete: "分析完了！", retry: "再試行中..." },
    'ko': { encoding: "비디오 인코딩 중...", uploading: "클라우드로 업로드 중...", processing: "클라우드에서 처리 중...", ready: "비디오 준비 완료...", failed: "비디오 처리 실패.", init: "초기화 중...", analyzing: "Gemini가 행동 패턴을 분석 중입니다...", complete: "분석 완료!", retry: "재시도 중..." },
    'es': { encoding: "Codificando video...", uploading: "Subiendo video a la nube...", processing: "Procesando video en la nube...", ready: "Video listo...", failed: "Error al procesar el video.", init: "Inicializando...", analyzing: "Gemini está analizando patrones de comportamiento...", complete: "¡Análisis completo!", retry: "Reintentando..." },
    'fr': { encoding: "Encodage vidéo...", uploading: "Téléchargement vers le cloud...", processing: "Traitement vidéo...", ready: "Vidéo prête...", failed: "Échec du traitement vidéo.", init: "Initialisation...", analyzing: "Gemini analyse les comportements...", complete: "Analyse terminée !", retry: "Nouvelle tentative..." },
    'ru': { encoding: "Кодирование видео...", uploading: "Загрузка в облако...", processing: "Обработка видео...", ready: "Видео готово...", failed: "Ошибка обработки видео.", init: "Инициализация...", analyzing: "Gemini анализирует поведение...", complete: "Анализ завершен!", retry: "Повторная попытка..." },
    'ar': { encoding: "جاري تشفير الفيديو...", uploading: "جاري الرفع إلى السحابة...", processing: "جاري المعالجة...", ready: "الفيديو جاهز...", failed: "فشلت معالجة الفيديو.", init: "تهيئة...", analyzing: "Gemini يحلل أنماط السلوك...", complete: "اكتمل التحليل!", retry: "إعادة المحاولة..." },
  };
  return msgs[lang] || msgs['en'];
};

const prepareVideoContent = async (
  file: File, 
  language: Language,
  onProgress?: (status: string, percentage: number) => void
): Promise<VideoContent> => {
  const ai = getAI();
  const t = getStatusMessages(language);

  const mimeType = getMimeType(file);

  // We increase the INLINE limit to 50MB. 
  // This bypasses the 'files.upload' API for medium-sized files, 
  // avoiding CORS errors in browser environments. 
  // Note: Extremely large payloads might still be rejected by the API with a 413 error.
  const INLINE_LIMIT_BYTES = 50 * 1024 * 1024;

  if (file.size < INLINE_LIMIT_BYTES) {
    if (onProgress) onProgress(t.encoding, 10);
    const base64 = await fileToBase64(file);
    if (onProgress) onProgress(t.ready, 40);
    return {
      inlineData: {
        mimeType: mimeType,
        data: base64
      }
    };
  } else {
    // For files > 50MB, we must try the File API, though it often fails in browsers due to CORS.
    let uploadTimer: any = null;
    
    try {
      if (onProgress) onProgress(t.uploading, 10);
      
      // Simulate upload progress (10 -> 50) since SDK currently doesn't expose it in the promise
      let currentUploadProgress = 10;
      uploadTimer = setInterval(() => {
        currentUploadProgress += (50 - currentUploadProgress) * 0.05; // Asymptotic approach
        if (onProgress) onProgress(t.uploading, Math.round(currentUploadProgress));
      }, 500);
      
      const uploadResult = await ai.files.upload({
        file: file,
        config: { 
          displayName: file.name,
          mimeType: mimeType 
        }
      });
      
      if (uploadTimer) clearInterval(uploadTimer);

      // The SDK returns the file metadata directly, not wrapped in a .file property
      let fileUri = uploadResult.uri;
      let state = uploadResult.state;
      const fileName = uploadResult.name;

      if (onProgress) onProgress(t.processing, 50);

      // Wait for processing
      let attempt = 0;
      while (state === "PROCESSING") {
        attempt++;
        // Fake progress increment during processing wait (50 -> 80)
        const progress = Math.min(80, 50 + (attempt * 2)); // Faster increments
        if (onProgress) onProgress(t.processing, progress);

        // Check every 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        const fileStatus = await ai.files.get({ name: fileName });
        state = fileStatus.state;
        if (state === "FAILED") {
          throw new Error(t.failed);
        }
      }

      // Add a safety buffer after processing completes to ensure embeddings are propagated
      if (onProgress) onProgress(t.processing, 90);
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (onProgress) onProgress(t.ready, 95);

      return {
        fileData: {
          fileUri: fileUri,
          mimeType: mimeType
        }
      };
    } catch (error: any) {
      if (uploadTimer) clearInterval(uploadTimer);
      console.error("File upload failed:", error);

      // Check for the specific CORS/Header missing error commonly found in browser deployments
      if (error.message && (
          error.message.includes('x-google-upload-url') || 
          error.message.includes('Failed to get upload url')
        )) {
        throw new Error(
           language === 'zh-TW' ? "由於瀏覽器安全限制，無法上傳超大型檔案。請嘗試使用小於 50MB 的影片。" :
           language === 'zh-CN' ? "由于浏览器安全限制，无法上传超大型文件。请尝试使用小于 50MB 的视频。" :
           "Large file upload failed due to browser restrictions. Please try a video smaller than 50MB."
        );
      }
      
      throw error;
    }
  }
};

export const analyzeVideoBehavior = async (
  file: File,
  language: Language,
  onProgress?: (status: string, percentage: number) => void
): Promise<{ report: AnalysisReport; videoContent: VideoContent }> => {
  const ai = getAI();
  let analysisTimer: any = null;
  const t = getStatusMessages(language);
  
  if (onProgress) onProgress(t.init, 5);

  const videoContent = await prepareVideoContent(file, language, onProgress);
  if (onProgress) onProgress(t.analyzing, 80);

  // Simulate analysis progress
  let currentAnalysisProgress = 80;
  analysisTimer = setInterval(() => {
    currentAnalysisProgress += (99 - currentAnalysisProgress) * 0.02;
    if (onProgress) onProgress(t.analyzing, Math.round(currentAnalysisProgress));
  }, 800);

  const targetLang = getLanguageName(language);
  const langInstruction = `IMPORTANT: You MUST write all the values in the JSON response in ${targetLang}. Do NOT use any other language.`;

  // Base prompt structure
  const prompt = `
  Analyze the behavior of the characters using psychological concepts and human behavior theories.
  
  ${langInstruction}
  
  Focus on:
  1. Personality traits.
  2. Hidden intentions and motivations.
  3. Practical reasoning.
  4. An emotional intensity trajectory.

  **Formatting:**
  - Use markdown **bold** for key terms.
  - Return PURE JSON object.
  
  Structure:
  {
    "summary": "Overview...",
    "personality": "Analysis...",
    "intentions": "Intentions...",
    "motivation": "Motivation...",
    "emotionalTrajectory": [{"time": "Start", "intensity": 20, "emotion": "Neutral"}]
  }
  `;

  const modelParams: any = {
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        videoContent.inlineData ? { inlineData: videoContent.inlineData } : { fileData: videoContent.fileData },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
    }
  };

  // Retry logic
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const response = await ai.models.generateContent(modelParams);

      if (analysisTimer) clearInterval(analysisTimer);
      if (onProgress) onProgress(t.complete, 100);

      if (response.text) {
        const cleanText = cleanJSON(response.text);
        const report = JSON.parse(cleanText) as AnalysisReport;
        
        return {
          report: report,
          videoContent: videoContent
        };
      }
      throw new Error("No response text generated");

    } catch (error: any) {
      console.error(`Analysis attempt ${retryCount + 1} failed:`, error);
      
      const isRetryable = error.message?.includes('500') || error.status === 500 || error.message?.includes('Internal');
      
      if (isRetryable && retryCount < maxRetries - 1) {
        retryCount++;
        await new Promise(r => setTimeout(r, 2000 * retryCount));
        if (onProgress) onProgress(`${t.retry} (${retryCount})...`, 85);
        continue;
      }
      
      if (analysisTimer) clearInterval(analysisTimer);
      throw error;
    }
  }
  
  throw new Error("Analysis failed after multiple retries");
};

export const analyzeMBTI = async (
  report: AnalysisReport, 
  language: Language
): Promise<MBTIResult> => {
  const ai = getAI();
  const targetLang = getLanguageName(language);
  const langInstruction = `Respond in ${targetLang}.`;

  const prompt = `
    Based on the following behavioral analysis report of a character in a video, determine their most likely MBTI personality type.
    
    Report Data:
    Summary: ${report.summary}
    Personality: ${report.personality}
    Intentions: ${report.intentions}
    Motivations: ${report.motivation}

    ${langInstruction}

    Task:
    1. Identify the 4-letter MBTI type.
    2. Provide a title (e.g., The Architect, The Advocate).
    3. Explain the cognitive functions (Ni, Fe, Ti, Se, etc.) that justify this choice based on the behavior.
    4. Provide a description of why this fits.

    Return JSON format only:
    {
      "type": "INFJ",
      "title": "The Advocate",
      "description": "Explanation...",
      "cognitiveFunctions": ["Ni: explanation", "Fe: explanation"]
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { text: prompt },
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = cleanJSON(response.text || "{}");
  return JSON.parse(text) as MBTIResult;
};

// Create a persistent chat session initialized with the video
export const createChatSession = (videoContent: VideoContent, language: Language) => {
  const ai = getAI();
  const targetLang = getLanguageName(language);
  const langSystemInstruction = `You are an expert behavioral psychologist. Answer in ${targetLang}. Use markdown **bold** to highlight key psychological terms and important findings in your response to make it easy to read. Structure your answers clearly.`;

  const videoPart = videoContent.inlineData 
    ? { inlineData: videoContent.inlineData } 
    : { fileData: videoContent.fileData };

  const historyParts = [
      videoPart,
      { text: "Here is the video for analysis. Please answer my future questions based on this video." }
  ];

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: [
       {
        role: 'user',
        parts: historyParts
      },
      {
        role: 'model',
        parts: [{ text: language === 'zh-TW' ? "好的，我已經準備好根據這段影片回答您的問題。" : "Understood. I have analyzed the video and I am ready to answer your questions." }]
      }
    ],
    config: {
      systemInstruction: langSystemInstruction
    }
  });
};

export const transcribeAudio = async (audioBlob: Blob, language: Language): Promise<string> => {
  const ai = getAI();
  
  // Convert Blob to Base64
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
    }
    reader.readAsDataURL(audioBlob);
  });

  const targetLang = getLanguageName(language);
  const instruction = `Transcribe this audio exactly as spoken in ${targetLang}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: audioBlob.type,
            data: base64
          }
        },
        { text: instruction }
      ]
    }
  });

  return response.text || "";
};

export const getFastQuickReply = async (input: string, language: Language): Promise<string> => {
  const ai = getAI();
  const targetLang = getLanguageName(language);
  const prompt = `Generate a very short, encouraging 3-word phrase in ${targetLang} related to: ${input}`;

  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: prompt
  });
  return response.text || "Ready to analyze!";
};
