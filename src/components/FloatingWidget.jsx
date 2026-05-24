import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Copy, Check, Loader2, Settings, Clipboard, Key, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateReplies } from '../services/ai';

export const FloatingWidget = ({ apiKey: externalApiKey }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [replies, setReplies] = useState(null);
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    
    // Configurations
    const [localApiKey, setLocalApiKey] = useState(localStorage.getItem('openrouter_api_key') || '');
    const [vibe, setVibe] = useState('Normal');
    const [gender, setGender] = useState('female');
    const [stage, setStage] = useState('replying');

    // Dragging state
    const [pos, setPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    const [dragging, setDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const bubbleRef = useRef(null);
    const popupRef = useRef(null);
    const hasDragged = useRef(false);

    const activeApiKey = localApiKey || externalApiKey;

    const VIBES = [
        { name: 'Normal', emoji: '😐' },
        { name: 'Flirty', emoji: '😘' },
        { name: 'Funny', emoji: '😂' },
        { name: 'Romantic', emoji: '❤️' },
        { name: 'Cold', emoji: '🥶' },
    ];

    const GENDERS = [
        { value: 'female', label: 'Woman', emoji: '♀️' },
        { value: 'male', label: 'Man', emoji: '♂️' },
        { value: 'lgbtq', label: 'LGBTQ+', emoji: '🏳️‍🌈' }
    ];

    const STAGES = [
        { value: 'opening', label: 'Opening', emoji: '🚀' },
        { value: 'replying', label: 'Replying', emoji: '💬' },
        { value: 'closing', label: 'Closing', emoji: '👋' },
        { value: 'greeting', label: 'Greeting', emoji: '🤝' }
    ];

    // Keep bubble in bounds when window resizing
    useEffect(() => {
        const handleResize = () => {
            setPos(prev => {
                const nextX = Math.min(Math.max(prev.x, 0), window.innerWidth - 56);
                const nextY = Math.min(Math.max(prev.y, 0), window.innerHeight - 56);
                return { x: nextX, y: nextY };
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync external API key changes
    useEffect(() => {
        if (externalApiKey) {
            setLocalApiKey(externalApiKey);
        }
    }, [externalApiKey]);

    // Close popup on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!isOpen) return;
            if (
                popupRef.current && !popupRef.current.contains(e.target) &&
                bubbleRef.current && !bubbleRef.current.contains(e.target)
            ) {
                setIsOpen(false);
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    // --- Drag Logic ---
    const onMouseDown = (e) => {
        hasDragged.current = false;
        setDragging(true);
        dragOffset.current = {
            x: e.clientX - pos.x,
            y: e.clientY - pos.y,
        };
        e.preventDefault();
    };

    const onTouchStart = (e) => {
        hasDragged.current = false;
        setDragging(true);
        const touch = e.touches[0];
        dragOffset.current = {
            x: touch.clientX - pos.x,
            y: touch.clientY - pos.y,
        };
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!dragging) return;
            hasDragged.current = true;
            const newX = Math.min(Math.max(e.clientX - dragOffset.current.x, 0), window.innerWidth - 56);
            const newY = Math.min(Math.max(e.clientY - dragOffset.current.y, 0), window.innerHeight - 56);
            setPos({ x: newX, y: newY });
        };
        const onTouchMove = (e) => {
            if (!dragging) return;
            hasDragged.current = true;
            const touch = e.touches[0];
            const newX = Math.min(Math.max(touch.clientX - dragOffset.current.x, 0), window.innerWidth - 56);
            const newY = Math.min(Math.max(touch.clientY - dragOffset.current.y, 0), window.innerHeight - 56);
            setPos({ x: newX, y: newY });
        };
        const onMouseUp = () => setDragging(false);
        const onTouchEnd = () => setDragging(false);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [dragging]);

    const handleBubbleClick = () => {
        if (!hasDragged.current) setIsOpen(prev => !prev);
    };

    // --- Paste Logic ---
    const handlePaste = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            setText(clipboardText);
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    // --- Generate Logic ---
    const handleGenerate = async () => {
        if (!text.trim() || loading) return;
        if (!activeApiKey) {
            setError('API Key is required. Please set it in Settings.');
            setShowSettings(true);
            return;
        }

        setLoading(true);
        setError(null);
        setReplies(null);
        try {
            const result = await generateReplies(activeApiKey, text, null, gender, stage, vibe, 'en', false);
            setReplies(result.replies);
        } catch (err) {
            setError(err.message || 'Failed to generate replies.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (content, index) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleClose = () => {
        setIsOpen(false);
        setShowSettings(false);
        setText('');
        setReplies(null);
        setError(null);
    };

    const saveSettings = (val) => {
        setLocalApiKey(val);
        localStorage.setItem('openrouter_api_key', val);
    };

    // Determine popup placement (flip if close to borders)
    const popupAbove = pos.y > window.innerHeight / 2;
    const popupLeft = pos.x > window.innerWidth / 2;

    return (
        <>
            {/* Floating Bubble */}
            <div
                ref={bubbleRef}
                style={{
                    position: 'fixed',
                    left: pos.x,
                    top: pos.y,
                    zIndex: 9999,
                    cursor: dragging ? 'grabbing' : 'grab',
                    touchAction: 'none',
                    userSelect: 'none',
                }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                onClick={handleBubbleClick}
            >
                <motion.div
                    animate={{ scale: isOpen ? 0.9 : 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-xl shadow-purple-900/50 flex items-center justify-center relative"
                >
                    {!isOpen && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-purple-500/30 pointer-events-none" />
                    )}
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                <X size={22} className="text-white" />
                            </motion.div>
                        ) : (
                            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                <Sparkles size={22} className="text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Popup Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={popupRef}
                        initial={{ opacity: 0, scale: 0.85, y: popupAbove ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: popupAbove ? 10 : -10 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        style={{
                            position: 'fixed',
                            left: popupLeft ? Math.max(pos.x - 320 + 56, 8) : Math.min(pos.x, window.innerWidth - 336),
                            top: popupAbove ? Math.max(pos.y - 450, 8) : pos.y + 68,
                            zIndex: 9998,
                            width: 320,
                        }}
                    >
                        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10"
                            style={{ background: 'rgba(15,18,35,0.97)', backdropFilter: 'blur(20px)' }}>

                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                                        <Sparkles size={12} className="text-white" />
                                    </div>
                                    <span className="text-white font-semibold text-sm">Quick Reply</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={() => setShowSettings(!showSettings)} 
                                        className={`p-1 rounded-full transition-colors ${showSettings ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-slate-400'}`}
                                    >
                                        <Settings size={14} />
                                    </button>
                                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {showSettings ? (
                                /* Settings Area */
                                <div className="p-4 space-y-4">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                                        <Key size={12} /> API Configuration
                                    </h3>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-slate-400">OpenRouter API Key</label>
                                        <input
                                            type="password"
                                            value={localApiKey}
                                            onChange={(e) => saveSettings(e.target.value)}
                                            placeholder="sk-or-v1-..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500/50 transition-all"
                                        />
                                        <p className="text-[10px] text-slate-500 leading-tight">
                                            Keys are securely saved in your browser's local storage.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setShowSettings(false)}
                                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-medium transition-all"
                                    >
                                        Back to Chat
                                    </button>
                                </div>
                            ) : (
                                /* Chat Widget Body */
                                <>
                                    {/* Selectors Panel (Gender, Stage) */}
                                    <div className="px-4 pt-3 flex gap-2 border-b border-white/5 pb-2">
                                        <div className="flex-1 space-y-1">
                                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Persona</span>
                                            <div className="flex gap-1">
                                                {GENDERS.map(g => (
                                                    <button
                                                        key={g.value}
                                                        onClick={() => setGender(g.value)}
                                                        title={g.label}
                                                        className={`flex-1 py-1 rounded-lg text-xs flex items-center justify-center transition-all ${gender === g.value 
                                                            ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                                                            : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'}`}
                                                    >
                                                        {g.emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Stage</span>
                                            <div className="flex gap-1">
                                                {STAGES.map(s => (
                                                    <button
                                                        key={s.value}
                                                        onClick={() => setStage(s.value)}
                                                        title={s.label}
                                                        className={`flex-1 py-1 rounded-lg text-xs flex items-center justify-center transition-all ${stage === s.value 
                                                            ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                                                            : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'}`}
                                                    >
                                                        {s.emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vibe Selector */}
                                    <div className="px-4 pt-2.5 flex gap-1.5 flex-wrap">
                                        {VIBES.map(v => (
                                            <button
                                                key={v.name}
                                                onClick={() => setVibe(v.name)}
                                                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${vibe === v.name
                                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                                                    : 'bg-white/5 text-slate-400 border border-white/10 hover:border-purple-500/40'}`}
                                            >
                                                <span>{v.emoji}</span> {v.name}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Text Input */}
                                    <div className="p-4 space-y-3">
                                        <div className="relative">
                                            <textarea
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                                                placeholder="Paste message here..."
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-9 py-2.5 text-sm text-white placeholder-slate-500 resize-none outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                            />
                                            <button
                                                onClick={handlePaste}
                                                title="Paste from Clipboard"
                                                className="absolute right-2.5 top-2.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all border border-white/5"
                                            >
                                                <Clipboard size={12} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleGenerate}
                                            disabled={loading || !text.trim()}
                                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/30"
                                        >
                                            {loading ? (
                                                <><Loader2 size={15} className="animate-spin" /> Thinking...</>
                                            ) : (
                                                <><Sparkles size={15} /> Generate Reply</>
                                            )}
                                        </button>

                                        {/* Error */}
                                        {error && (
                                            <p className="text-red-400 text-xs text-center px-2 font-medium">{error}</p>
                                        )}
                                    </div>

                                    {/* Replies Container */}
                                    <AnimatePresence>
                                        {replies && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="border-t border-white/10 overflow-hidden"
                                            >
                                                <div className="px-4 pt-2.5 pb-1">
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Replies</span>
                                                </div>
                                                <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto">
                                                    {replies.map((reply, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.08 }}
                                                            className="group flex items-start justify-between gap-2 bg-white/5 border border-white/8 rounded-xl p-3 hover:border-purple-500/30 transition-colors"
                                                        >
                                                            <div className="flex items-start gap-2 min-w-0">
                                                                <span className="text-base shrink-0 mt-0.5">{reply.emoji}</span>
                                                                <div className="min-w-0">
                                                                    <p className="text-[10px] text-purple-400 font-medium mb-0.5">{reply.tone}</p>
                                                                    <p className="text-white text-xs leading-relaxed">{reply.content}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleCopy(reply.content, i)}
                                                                className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors mt-0.5"
                                                            >
                                                                {copiedIndex === i
                                                                    ? <Check size={13} className="text-green-400" />
                                                                    : <Copy size={13} />
                                                                }
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
