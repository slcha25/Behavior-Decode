# BehaviorDecode

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://behaviordecode-finalversion-632369386312.us-west1.run.app/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-3.0-orange)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**BehaviorDecode** is an AI-powered web application that analyzes video content to decode human behavior, personality traits, emotional drivers, and hidden intentions using advanced psychological profiling and Google's Gemini AI.

🔗 **Live Demo**: [https://behaviordecode-finalversion-632369386312.us-west1.run.app/](https://behaviordecode-finalversion-632369386312.us-west1.run.app/)

---

## ✨ Features

### Core Analysis
- **Video Behavior Analysis** - Upload videos for comprehensive behavioral analysis
- **Personality Profiling** - Character trait analysis based on observed behaviors
- **Emotional Trajectory** - Track emotional intensity over time with interactive charts
- **Intent & Motivation Analysis** - Decode hidden intentions and psychological drivers

### AI-Powered Features
- **Gemini 3 Pro Integration** - State-of-the-art multimodal AI for behavior analysis
- **Real-time AI Chat** - Interactive Q&A about video content (powered by Gemini)
- **MBTI Personality Analysis** - Deep dive into personality types with cognitive functions

### User Experience
- **Multi-language Support** - 9 languages including English, Chinese (Traditional/Simplified), Japanese, Korean, Spanish, French, Russian, Arabic
- **RTL Support** - Full right-to-left layout for Arabic
- **Responsive Design** - Works seamlessly on desktop and tablet devices
- **Analysis History** - Save and revisit previous analyses

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

### AI & APIs
- **Google Gemini 3 Pro** - Video analysis and chat

### Backend Services
- **LocalStorage** - User data, history, and usage tracking
- **Stripe Simulation** - Payment processing demo

### Deployment
- **Google Cloud Run** - Containerized deployment

---

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key

---

## 🚀 Getting Started

## 📁 Project Structure

```bash
Behavior-Decode/
├── src/
│   ├── components/
│   │   ├── AccountDetails.tsx      # User account management
│   │   ├── AnalysisHistory.tsx     # Historical analyses viewer
│   │   ├── AnalysisReport.tsx      # Main report display with charts
│   │   ├── AuthPage.tsx            # Login/Registration
│   │   ├── ChatInterface.tsx       # Real-time AI chat
│   │   ├── PricingModal.tsx        # Pricing plans display
│   │   ├── StripeSimulation.tsx    # Payment processing
│   │   ├── UserProfile.tsx         # User profile dashboard
│   │   └── VideoUploader.tsx       # Video upload component
│   ├── services/
│   │   ├── geminiService.ts        # Gemini AI integration
│   │   ├── authService.ts          # Authentication logic
│   │   └── usageService.ts         # Credit tracking & history
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   └── App.tsx                     # Main application component
├── public/
├── package.json
├── tsconfig.json
└── tailwind.config.js
```
## 🌍 Supported Languages
|   |   |
|---|---|
| English (en) | Traditional Chinese (zh-TW) | 
| Simplified Chinese (zh-CN) | Japanese (ja) | 
| Korean (ko) | Spanish (es) | 
| French (fr) | Russian (ru) | 
| Arabic (ar) - with RTL support |

## 🔒 Data Privacy

- All user data is stored locally in your browser's LocalStorage
- No video data is permanently stored on servers
- API calls to Gemini are made directly from your browser
- Payment processing is simulated for demo purposes

## 📝 License

Distributed under the MIT License. See LICENSE for more information.

## 🙏 Acknowledgments

- Google Gemini AI - For providing the multimodal AI capabilities
- React Community - For the excellent ecosystem and tools
- Tailwind CSS - For the utility-first CSS framework

## 📧 Contact

Created by [Sandra Chan](https://www.linkedin.com/in/sok-chan/) - feel free to contact me

## ⚠️ Disclaimer
BehaviorDecode provides AI-generated behavioral analysis based on psychological theories. This tool is for entertainment and educational purposes only. It is not a substitute for professional psychological or medical advice, diagnosis, or treatment. Always seek the advice of qualified mental health professionals for any behavioral or psychological concerns.
