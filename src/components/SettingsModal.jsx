import React, { useState } from 'react';
import { X, Key, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsModal = ({ isOpen, onClose, apiKey: initialKey, onSave, language, onLanguageChange, curiosityMode, onCuriosityModeChange, t }) => {
    const [tempKey, setTempKey] = useState(initialKey);

    const handleSave = () => {
        localStorage.setItem('openrouter_api_key', tempKey);
        onSave(tempKey);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md glass-panel p-6 space-y-6"
                    >
                        <h2 className="text-2xl font-bold mb-2">{t.settings}</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Enter your OpenRouter API Key to start generating replies.{' '}
                            <a
                                href="https://openrouter.ai/keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Get your key here
                            </a>
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">{t.language}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { code: 'en', label: 'English' },
                                    { code: 'fr', label: 'Français' },
                                    { code: 'zh', label: '中文' },
                                    { code: 'am', label: 'አማርኛ' },
                                    { code: 'rw', label: 'Kinyarwanda' },
                                    { code: 'my', label: 'မြန်မာ' }
                                ].map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => onLanguageChange(lang.code)}
                                        className={`p-2 rounded-lg text-sm transition-all ${language === lang.code
                                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Curiosity Mode Toggle */}
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <h3 className="text-sm font-medium text-slate-300">{t.curiosityMode}</h3>
                                <p className="text-xs text-slate-500 mt-1">{t.curiosityModeDesc}</p>
                            </div>
                            <button
                                onClick={() => onCuriosityModeChange(!curiosityMode)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${curiosityMode ? 'bg-primary' : 'bg-slate-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${curiosityMode ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">{t.apiKey}</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    placeholder="sk-or-v1-..."
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-200 placeholder-slate-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {t.save}
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
