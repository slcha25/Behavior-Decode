
import { GoogleGenAI } from "@google/genai";
import { AnalysisReport, Language, MBTIResult } from "../types";

// Initialize GenAI
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Base64
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

const cleanJSON = (text: string): string => {
  return text.replace(/```json\n?|\n?```/g, '').trim();
};

const getMimeType = (file: File): string => {
  if (file.type && file.type !== "") return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4': return 'video/mp4';
    case 'mov': return 'video/quicktime';
    case 'webm': return 'video/webm';
    default: return 'video/mp4';
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

const getStatusMessages = (lang: Language) => {
  const msgs: Record<string, any> = {
    'en': { encoding: "Encoding...", uploading: "Uploading...", processing: "Processing...", ready: "Ready...", init: "Init...", analyzing: "Analyzing behavior patterns...", complete: "Analysis complete!", retry: "Retrying..." },
    'zh-TW': { encoding: "編碼中...", uploading: "上傳中...", processing: "處理中...", ready: "準備就緒...", init: "初始化...", analyzing: "正在根據行為心理學理論分析...", complete: "分析完成！", retry: "重試中..." },
  };
  return msgs[lang] || msgs['en'];
};

const prepareVideoContent = async (file: File, language: Language, onProgress?: (status: string, percentage: number) => void): Promise<any> => {
  const ai = getAI();
  const t = getStatusMessages(language);
  const mimeType = getMimeType(file);
  const INLINE_LIMIT_BYTES = 50 * 1024 * 1024;

  if (file.size < INLINE_LIMIT_BYTES) {
    const base64 = await fileToBase64(file);
    return { inlineData: { mimeType, data: base64 } };
  } else {
    const uploadResult = await ai.files.upload({ file, config: { displayName: file.name, mimeType } });
    let state = uploadResult.state;
    while (state === "PROCESSING") {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const fileStatus = await ai.files.get({ name: uploadResult.name });
      state = fileStatus.state;
    }
    return { fileData: { fileUri: uploadResult.uri, mimeType } };
  }
};

export const analyzeVideoBehavior = async (file: File, language: Language, onProgress?: (status: string, percentage: number) => void): Promise<{ report: AnalysisReport; videoContent: any }> => {
  const ai = getAI();
  const videoContent = await prepareVideoContent(file, language, onProgress);
  const targetLang = getLanguageName(language);

  const introPrefix = language === 'zh-TW' ? "根據影片內容與行為心理學理論，以下是詳細分析：" : "Based on video content and behavioral psychology theories, here is the detailed analysis:";

  const prompt = `
  ${introPrefix}

  Analyze behavior using psychological theories. Do NOT claim to be a licensed professional.
  
  Write all JSON values in ${targetLang}. Use markdown **bold** for key terms.
  
  Structure:
  {
    "summary": "Start with: '${introPrefix}' ... then overview...",
    "personality": "Analysis based on observed traits...",
    "intentions": "Intentions and behavioral analysis...",
    "motivation": "Psychological motivations...",
    "emotionalTrajectory": [{"time": "00:00", "intensity": 50, "emotion": "Calm"}]
  }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [
      videoContent.inlineData ? { inlineData: videoContent.inlineData } : { fileData: videoContent.fileData },
      { text: prompt }
    ]},
    config: { responseMimeType: "application/json" }
  });

  const report = JSON.parse(cleanJSON(response.text || "{}")) as AnalysisReport;
  return { report, videoContent };
};

export const analyzeMBTI = async (report: AnalysisReport, language: Language): Promise<MBTIResult> => {
  const ai = getAI();
  const targetLang = getLanguageName(language);
  const prompt = `Based on behavioral psychology analysis data, determine character MBTI. Respond in ${targetLang}. Return JSON only.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { text: `${prompt} Data: ${JSON.stringify(report)}` },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJSON(response.text || "{}")) as MBTIResult;
};

export const createChatSession = (videoContent: any, language: Language) => {
  const ai = getAI();
  const targetLang = getLanguageName(language);
  const intro = language === 'zh-TW' ? "根據影片內容與心理行為理論" : "Based on video patterns and behavioral theories";
  
  const systemInstruction = `You are an assistant providing analysis based on psychological theories. Do NOT call yourself a professional psychologist. Always start or frame your findings with: "${intro}". Respond in ${targetLang}. Use markdown **bold**.`;

  const videoPart = videoContent.inlineData ? { inlineData: videoContent.inlineData } : { fileData: videoContent.fileData };

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: [
      { role: 'user', parts: [videoPart, { text: "Analyze this video based on behavioral science." }] },
      { role: 'model', parts: [{ text: language === 'zh-TW' ? "好的，我將根據行為心理學理論為您分析這段影片。" : "Understood. I will provide analysis based on behavioral psychology theories." }] }
    ],
    config: { systemInstruction }
  });
};

export const transcribeAudio = async (audioBlob: Blob, language: Language): Promise<string> => {
  const ai = getAI();
  const base64 = await fileToBase64(new File([audioBlob], "audio.webm"));
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ inlineData: { mimeType: audioBlob.type, data: base64 } }, { text: "Transcribe audio." }] }
  });
  return response.text || "";
};
