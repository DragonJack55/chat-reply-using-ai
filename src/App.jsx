import { useState, useCallback } from 'react';
import './index.css';
import Layout from './components/Layout';
import { InputSection } from './components/InputSection';
import { ReplyCard } from './components/ReplyCard';
import { SettingsModal } from './components/SettingsModal';
import { CreateVibeModal } from './components/CreateVibeModal';
import { generateReplies, analyzeTextOnly } from './services/ai';
import { getTranslation } from './constants/translations';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openrouter_api_key') || '');
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [curiosityMode, setCuriosityMode] = useState(localStorage.getItem('curiosityMode') === 'true');
  const [customVibes, setCustomVibes] = useState(JSON.parse(localStorage.getItem('customVibes') || '[]'));
  const [isCreateVibeOpen, setIsCreateVibeOpen] = useState(false);

  const t = getTranslation(language);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleCuriosityModeChange = (enabled) => {
    setCuriosityMode(enabled);
    localStorage.setItem('curiosityMode', enabled);
  };

  const handleCreateVibe = (newVibe) => {
    const updatedVibes = [...customVibes, newVibe];
    setCustomVibes(updatedVibes);
    localStorage.setItem('customVibes', JSON.stringify(updatedVibes));
  };

  const handleGenerate = async (text, image, gender, conversationStage, vibe) => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null); // Reset analysis on new generation
    try {
      const result = await generateReplies(apiKey, text, image, gender, conversationStage, vibe, language, curiosityMode);
      setReplies(result.replies);
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err.message || "Failed to generate replies. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = useCallback(async (text) => {
    if (!apiKey || !text.trim()) return;

    // Don't clear existing analysis immediately to avoid flickering
    try {
      const result = await analyzeTextOnly(apiKey, text);
      if (result) {
        setAnalysis(result);
      }
    } catch (err) {
      console.error("Quick analysis failed:", err);
    }
  }, [apiKey]);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
  };

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'premium'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <Layout
      onSettingsClick={() => setIsSettingsOpen(true)}
      theme={theme}
      onThemeToggle={toggleTheme}
      curiosityMode={curiosityMode}
      onCuriosityModeChange={handleCuriosityModeChange}
      t={t}
    >
      <InputSection
        onGenerate={handleGenerate}
        onAnalyze={handleAnalyze}
        loading={loading}
        analysis={analysis}
        t={t}
        onSettingsClick={() => setIsSettingsOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
        curiosityMode={curiosityMode}
        onCuriosityModeChange={handleCuriosityModeChange}
        customVibes={customVibes}
        onOpenCreateVibe={() => setIsCreateVibeOpen(true)}
      />

      {error && (
        <div className="w-full max-w-3xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {replies && (
        <div className="grid md:grid-cols-3 gap-4 w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          {replies.map((reply, index) => (
            <ReplyCard
              key={index}
              tone={reply.tone}
              emoji={reply.emoji}
              content={reply.content}
              delay={index * 0.1}
              t={t}
            />
          ))}
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
        language={language}
        onLanguageChange={handleLanguageChange}
        curiosityMode={curiosityMode}
        onCuriosityModeChange={handleCuriosityModeChange}
        t={t}
      />

      <CreateVibeModal
        isOpen={isCreateVibeOpen}
        onClose={() => setIsCreateVibeOpen(false)}
        onCreate={handleCreateVibe}
        t={t}
      />
    </Layout>
  );
}

export default App;
