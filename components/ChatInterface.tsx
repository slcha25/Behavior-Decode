
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Bot, Loader2, User, Lock, Sparkles } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { createChatSession, transcribeAudio } from '../services/geminiService';
import { canUseChat, getUsage } from '../services/usageService';
import { Chat, GenerateContentResponse } from '@google/genai';

interface VideoContent {
  inlineData?: { mimeType: string; data: string };
  fileData?: { fileUri: string; mimeType: string };
}

interface Props {
  videoContent: VideoContent;
  language: Language;
}

// Simple formatter for Bold and Line breaks
const FormatText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*.*?\*\*|\n)/g);
  
  return (
    <span className="leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="text-indigo-700 font-bold">{part.slice(2, -2)}</strong>;
        } else if (part === '\n') {
          return <br key={index} />;
        } else if (part.startsWith('- ')) {
           return <span key={index} className="block pl-4 -indent-4 mb-1">• {part.slice(2)}</span>
        }
        return part;
      })}
    </span>
  );
};

const ChatInterface: React.FC<Props> = ({ videoContent, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Everyone has access now based on your update request
  const hasAccess = canUseChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chatSessionRef = useRef<Chat | null>(null);

  const getTexts = (lang: Language) => {
    switch (lang) {
      case 'zh-TW': return { title: '行為分析助手', thinking: '思考中...', placeholder: '輸入您的問題...', error: '抱歉，發生錯誤，請重試。', greeting: "您好！我是您的行為分析助手。關於這段影片中的人物行為，您有什麼想問的嗎？", locked: "此功能僅限專業版用戶使用", upgrade: "立即升級解鎖即時對話" };
      default: return { title: 'Behavioral Assistant', thinking: 'Thinking...', placeholder: 'Type your question...', error: 'I encountered an error. Please try again.', greeting: "Hello! I'm your behavior analysis assistant. What would you like to know about the characters' behavior in this video?", locked: "AI Chat is for Premium users only", upgrade: "Upgrade to Premium to unlock" };
    }
  };

  const t = getTexts(language);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Initialize chat session once on mount or when language changes
  useEffect(() => {
    if (hasAccess) {
      chatSessionRef.current = createChatSession(videoContent, language);
      setMessages([{
        id: 'init',
        role: 'model',
        text: t.greeting,
        timestamp: new Date()
      }]);
    }
  }, [videoContent, language, hasAccess]); 

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      const botMsgId = (Date.now() + 1).toString();
      let fullText = "";
      
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: "",
        timestamp: new Date()
      }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
          fullText += text;
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: fullText } : msg
          ));
        }
      }
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: t.error,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsLoading(true);
        try {
          const text = await transcribeAudio(audioBlob, language);
          setInput(text);
        } catch (error) {
          console.error("Transcription error", error);
        } finally {
          setIsLoading(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-soft-200 shadow-xl overflow-hidden font-sans">
      <div className="bg-gradient-to-r from-soft-50 to-white p-4 border-b border-soft-100 flex items-center justify-between">
        <h3 className="font-semibold text-soft-800 flex items-center">
          <Bot size={20} className="mr-2 text-accent" />
          {t.title}
        </h3>
        <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-accent/5 text-accent rounded-full font-semibold border border-accent/10">Gemini 3 Pro</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-soft-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'model' && (
              <div className="flex-shrink-0 mr-3 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                <Bot size={16} />
              </div>
            )}
            <div className={`max-w-[85%] p-4 rounded-2xl text-[15px] shadow-sm ${
              msg.role === 'user' 
                ? 'bg-accent text-white rounded-tr-none' 
                : 'bg-white border border-soft-100 text-soft-700 rounded-tl-none'
            }`}>
              {msg.role === 'user' ? (
                 <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                 <FormatText text={msg.text} />
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 ml-3 w-8 h-8 bg-soft-200 rounded-full flex items-center justify-center text-soft-500">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {isLoading && !isStreaming && (
          <div className="flex justify-start items-center">
             <div className="flex-shrink-0 mr-3 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                <Bot size={16} />
             </div>
             <div className="bg-white border border-soft-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                <Loader2 className="animate-spin text-accent" size={16} />
                <span className="text-xs text-soft-500">{t.thinking}</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-soft-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-all duration-300 ${
              isRecording 
                ? 'bg-red-50 text-red-500 hover:bg-red-100 ring-2 ring-red-100 animate-pulse' 
                : 'bg-soft-50 text-soft-500 hover:bg-soft-100 hover:text-soft-800'
            }`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.placeholder}
            className="flex-1 bg-soft-50 border border-soft-200 text-soft-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder:text-soft-400"
            disabled={isLoading && !isStreaming || isRecording}
          />
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || (isLoading && !isStreaming)}
            className="p-3 bg-accent text-white rounded-xl hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-accent/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
