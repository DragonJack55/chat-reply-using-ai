import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Sparkles, Lightbulb, LightbulbOff, Settings, X, ChevronDown, ChevronUp, MessageSquarePlus, Sun, Moon, Sparkles as SparklesIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InputSection = ({ onGenerate, onAnalyze, loading, analysis, t, onSettingsClick, theme, onThemeToggle, curiosityMode, onCuriosityModeChange, customVibes, onOpenCreateVibe }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [gender, setGender] = useState('female');
    const [conversationStage, setConversationStage] = useState('replying');
    const [vibe, setVibe] = useState('Normal');
    const [showAllVibes, setShowAllVibes] = useState(false);
    const fileInputRef = useRef(null);

    const VIBE_EMOJIS = {
        Normal: '😐',
        Funny: '😂',
        Toxic: '😭',
        Dry: '😐',
        Flirty: '😘',
        Sweetheart: '💖',
        Crazy: '🤪',
        Philosophical: '🤔',
        Romantic: '❤️',
        Inspirational: '🌟',
        Sarcastic: '😏',
        Cheesy: '🧀',
        GenZ: '💀',
        Rhyming: '🎶',
        Humorous: '😁',
        Optimistic: '😊',
        Nostalgic: '🕰️',
        Professional: '👔',
        Cold: '🥶',
        Friendly: '🤗'
    };

    const STAGE_EMOJIS = {
        opening: '🚀',
        replying: '💬',
        closing: '👋',
        greeting: '🤝'
    };

    const GENDER_EMOJIS = {
        female: '♀️',
        male: '♂️',
        lgbtq: '🏳️‍🌈'
    };

    const presets = [
        { label: "Reply to ghosting", context: "Someone hasn't replied to me in days" },
        { label: "Flirty comeback", context: "I want to send a flirty message" },
        { label: "Jealous message", context: "I'm feeling jealous about their activity" },
        { label: "Hard-to-get", context: "I want to play hard to get" },
    ];

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImage(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = () => {
        if (conversationStage !== 'greeting' && !text.trim() && !image) return;
        onGenerate(text, image, gender, conversationStage, vibe);
    };

    const handlePresetClick = (context) => {
        onGenerate(context, null, gender, conversationStage, vibe);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const getThemeIcon = () => {
        if (theme === 'light') return <Sun size={20} />;
        if (theme === 'dark') return <Moon size={20} />;
        return <SparklesIcon size={20} className="text-purple-400" />;
    };

    return (
        <div className="w-full space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-main)] to-[var(--text-secondary)]">
                        Kulikéun
                    </h1>
                    <span className="text-sm text-[var(--text-secondary)]">AI Reply Assistant</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={onThemeToggle} className="p-2 rounded-full hover:bg-[var(--bg-card)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]">
                        {getThemeIcon()}
                    </button>
                    <button onClick={onCuriosityModeChange} className="p-2 rounded-full hover:bg-[var(--bg-card)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]">
                        {curiosityMode ? <Lightbulb size={20} className="text-yellow-400" /> : <LightbulbOff size={20} />}
                    </button>
                    <button onClick={onSettingsClick} className="p-2 rounded-full hover:bg-[var(--bg-card)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Analysis Result */}
            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-panel p-5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500" />
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold">Mood</span>
                                <p className="text-[var(--text-main)] font-medium text-lg">{analysis.mood}</p>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">Advice</span>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{analysis.advice}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="space-y-4">
                <div className="relative bg-[var(--bg-input)] rounded-3xl p-4 border border-[var(--border-color)] focus-within:border-purple-500/50 transition-colors shadow-sm">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t?.inputPlaceholder || "Paste message..."}
                        className="w-full bg-transparent border-none outline-none text-[var(--text-main)] text-lg placeholder-[var(--text-secondary)] min-h-[120px] resize-none"
                    />

                    {/* Image Preview inside input */}
                    {preview && (
                        <div className="relative w-20 h-20 mt-2 rounded-xl overflow-hidden group">
                            <img src={preview} alt="Upload" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <button onClick={clearImage} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={16} className="text-white" />
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-4 border-t border-[var(--border-color)] pt-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-full hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-purple-400 transition-colors"
                                title="Upload Image"
                            >
                                <ImageIcon size={22} />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                            <div className="w-px h-4 bg-[var(--border-color)] mx-1" />

                            {/* Presets */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-xs">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handlePresetClick(preset.context)}
                                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-main)] whitespace-nowrap border border-[var(--border-color)] transition-colors"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <span className="text-xs text-[var(--text-secondary)] font-medium whitespace-nowrap ml-2">
                            {text.length} chars
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {/* Gender Pills */}
                    {['female', 'male', 'lgbtq'].map(g => (
                        <button
                            key={g}
                            onClick={() => setGender(g)}
                            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${gender === g ? 'bg-[var(--text-main)] text-[var(--bg-main)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'}`}
                        >
                            <span>{GENDER_EMOJIS[g]}</span>
                            {g === 'female' ? 'Woman' : g === 'male' ? 'Man' : 'LGBTQ+'}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-[var(--border-color)] mx-1 self-center" />
                    {/* Stage Pills */}
                    {['opening', 'replying', 'closing', 'greeting'].map(s => (
                        <button
                            key={s}
                            onClick={() => setConversationStage(s)}
                            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${conversationStage === s ? 'bg-[var(--text-main)] text-[var(--bg-main)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'}`}
                        >
                            <span>{STAGE_EMOJIS[s]}</span>
                            {s}
                        </button>
                    ))}
                </div>

                {/* Vibe Selector */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Vibe</span>
                        <button onClick={() => setShowAllVibes(!showAllVibes)} className="text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300">
                            {vibe} {showAllVibes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* Primary Vibes */}
                        {['Normal', 'Flirty', 'Funny', 'Cold', 'Friendly', 'GenZ'].map(v => (
                            <button
                                key={v}
                                onClick={() => setVibe(v)}
                                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all flex items-center gap-1.5 ${vibe === v ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-purple-500/30'}`}
                            >
                                <span>{VIBE_EMOJIS[v]}</span>
                                {v}
                            </button>
                        ))}

                        {/* Expanded Vibes */}
                        <AnimatePresence>
                            {showAllVibes && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="w-full flex flex-wrap gap-2"
                                >
                                    {/* Custom Vibes */}
                                    {customVibes && customVibes.map((cv) => (
                                        <button
                                            key={cv.name}
                                            onClick={() => setVibe(cv.name)}
                                            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all flex items-center gap-1.5 ${vibe === cv.name
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                                                : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-purple-500/30'
                                                }`}
                                        >
                                            <span>{cv.emoji}</span>
                                            {cv.name}
                                        </button>
                                    ))}

                                    {/* Remaining Standard Vibes */}
                                    {Object.keys(VIBE_EMOJIS)
                                        .filter(v => !['Normal', 'Flirty', 'Funny', 'Cold', 'Friendly', 'GenZ'].includes(v))
                                        .map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => setVibe(v)}
                                                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all flex items-center gap-1.5 ${vibe === v ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-purple-500/30'}`}
                                            >
                                                <span>{VIBE_EMOJIS[v]}</span>
                                                {v}
                                            </button>
                                        ))}

                                    {/* Create Vibe Button */}
                                    <button
                                        onClick={onOpenCreateVibe}
                                        className="px-4 py-2 rounded-2xl text-sm font-medium bg-[var(--bg-input)] text-purple-400 border border-dashed border-purple-500/30 hover:bg-purple-500/10 flex items-center gap-1.5 transition-all"
                                    >
                                        <MessageSquarePlus size={16} />
                                        Create Vibe
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white font-bold text-lg shadow-xl shadow-purple-900/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <span className="animate-pulse">Thinking...</span> : (
                        <>
                            <span>Generate Reply</span>
                            <Sparkles size={20} className="text-purple-200" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
