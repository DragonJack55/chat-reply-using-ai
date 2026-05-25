import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Copy, Check, Loader2, Settings, Clipboard, Key, ExternalLink, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateReplies } from '../services/ai';

export const FloatingWidget = ({ apiKey: externalApiKey, theme }) => {
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

    // PiP Window state
    const [pipWindow, setPipWindow] = useState(null);

    // Initial position coordinates
    const initialX = window.innerWidth - 80;
    const initialY = window.innerHeight - 80;

    // React state for bubble position (used for placing popup adjacent to bubble)
    const [pos, setPos] = useState({ x: initialX, y: initialY });

    // Dragging Refs
    const bubbleRef = useRef(null);
    const popupRef = useRef(null);
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const startPointerRef = useRef({ x: 0, y: 0 });
    const startPosRef = useRef({ x: 0, y: 0 });
    const currentPosRef = useRef({ x: initialX, y: initialY });

    const activeApiKey = localApiKey || externalApiKey;
    const isPipSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

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

    // Clamping helper
    const clampPos = (x, y) => {
        const nextX = Math.min(Math.max(x, 0), window.innerWidth - 56);
        const nextY = Math.min(Math.max(y, 0), window.innerHeight - 56);
        return { x: nextX, y: nextY };
    };

    // Keep bubble in bounds when window resizing
    useEffect(() => {
        const handleResize = () => {
            setPos(prev => clampPos(prev.x, prev.y));
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

    // Close in-app popup on click outside
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

    // React to main theme changes inside the PiP window
    useEffect(() => {
        if (pipWindow) {
            pipWindow.document.documentElement.setAttribute('data-theme', theme || 'dark');
            pipWindow.document.body.style.backgroundColor = 'var(--bg-main)';
        }
    }, [theme, pipWindow]);

    // Cleanup PiP on unmount
    useEffect(() => {
        return () => {
            if (pipWindow) {
                pipWindow.close();
            }
        };
    }, [pipWindow]);

    // --- Pointer Drag Event Handlers ---
    const handlePointerDown = (e) => {
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        startPointerRef.current = { x: e.clientX, y: e.clientY };
        startPosRef.current = { x: pos.x, y: pos.y };
        currentPosRef.current = { x: pos.x, y: pos.y };
        
        // Capture pointer events to keep tracking even if mouse leaves the bubble bounds
        e.currentTarget.setPointerCapture(e.pointerId);
        e.stopPropagation();
    };

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current) return;
        
        const deltaX = e.clientX - startPointerRef.current.x;
        const deltaY = e.clientY - startPointerRef.current.y;
        
        // Mark as drag if moved by more than 4 pixels
        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
            hasDraggedRef.current = true;
        }
        
        const clamped = clampPos(startPosRef.current.x + deltaX, startPosRef.current.y + deltaY);
        currentPosRef.current = clamped;
        
        // Update styling directly in DOM for smooth 60fps performance and zero lag
        if (bubbleRef.current) {
            bubbleRef.current.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0)`;
        }
    };

    const handlePointerUp = (e) => {
        if (!isDraggingRef.current) return;
        
        e.currentTarget.releasePointerCapture(e.pointerId);
        isDraggingRef.current = false;
        
        if (hasDraggedRef.current) {
            // Apply drag coordinates to react state so popup places correctly
            setPos(currentPosRef.current);
        } else {
            // Treat as regular click
            handleBubbleClick();
        }
    };

    const handleBubbleClick = () => {
        if (pipWindow) {
            pipWindow.close();
            setPipWindow(null);
            return;
        }
        setIsOpen(prev => !prev);
    };

    // --- Desktop PiP Window Logic ---
    const togglePip = async () => {
        if (pipWindow) {
            pipWindow.close();
            setPipWindow(null);
            return;
        }

        if (isPipSupported) {
            try {
                const pw = await window.documentPictureInPicture.requestWindow({
                    width: 350,
                    height: 550,
                });

                // Copy styles and fonts
                document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
                    pw.document.head.appendChild(node.cloneNode(true));
                });
                document.querySelectorAll('link[rel="preconnect"], link[href*="googleapis.com"]').forEach((node) => {
                    pw.document.head.appendChild(node.cloneNode(true));
                });

                // Set theme attributes on PiP document
                const activeTheme = theme || document.documentElement.getAttribute('data-theme') || 'dark';
                pw.document.documentElement.setAttribute('data-theme', activeTheme);
                pw.document.body.style.backgroundColor = 'var(--bg-main)';
                pw.document.body.style.margin = '0';
                pw.document.body.style.padding = '0';
                pw.document.body.style.overflow = 'hidden';

                pw.addEventListener("pagehide", () => {
                    setPipWindow(null);
                });

                setPipWindow(pw);
                setIsOpen(false); // Close the in-app popup
                setShowSettings(false);
            } catch (err) {
                console.error('Error opening PiP window', err);
                setError('Failed to open always-on-top desktop window.');
            }
        } else {
            setError('Always-on-top desktop mode requires Chrome or Edge.');
        }
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

    const renderFloatBanner = () => {
        if (isPipSupported) {
            return (
                <div className="mx-4 mt-3 p-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                            <Laptop size={16} />
                        </div>
                        <div className="text-left animate-pulse">
                            <span className="text-xs font-bold text-purple-200 block leading-tight">Float on Desktop</span>
                            <span className="text-[10px] text-purple-400/90 block leading-tight">Keep widget always-on-top</span>
                        </div>
                    </div>
                    <button
                        onClick={togglePip}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-900/30 flex items-center gap-1 active:scale-95"
                    >
                        Enable <ExternalLink size={12} />
                    </button>
                </div>
            );
        }

        return (
            <div className="mx-4 mt-3 p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500">
                    <Laptop size={16} />
                </div>
                <div className="text-left">
                    <span className="text-xs font-bold text-slate-400 block leading-tight">Float on Desktop</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">Use Chrome or Edge for always-on-top</span>
                </div>
            </div>
        );
    };

    const renderChatBody = () => (
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
    );

    const renderSettingsBody = () => (
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
    );

    return (
        <>
            {/* Draggable Floating Web Bubble using standard Pointer Events */}
            <div
                ref={bubbleRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                    zIndex: 9999,
                    touchAction: 'none'
                }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-xl shadow-purple-900/50 flex items-center justify-center border border-white/10 cursor-grab active:cursor-grabbing select-none"
            >
                {pipWindow ? (
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                        <Laptop size={18} className="text-white mb-0.5" />
                        <span className="text-[8px] text-purple-200 font-bold uppercase tracking-tight scale-90">LIVE</span>
                    </div>
                ) : (
                    <div className="pointer-events-none flex items-center justify-center">
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
                    </div>
                )}
            </div>

            {/* Render In-App Floating Panel (Normal Mode) */}
            <AnimatePresence>
                {isOpen && !pipWindow && (
                    <motion.div
                        ref={popupRef}
                        initial={{ opacity: 0, scale: 0.85, y: popupAbove ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: popupAbove ? 10 : -10 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        style={{
                            position: 'fixed',
                            left: popupLeft ? Math.max(pos.x - 320 + 56, 8) : Math.min(pos.x, window.innerWidth - 336),
                            top: popupAbove ? Math.max(pos.y - 480, 8) : pos.y + 68,
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
                                    {isPipSupported && (
                                        <button 
                                            onClick={togglePip} 
                                            title="Float Everywhere (Always on Top)"
                                            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                    )}
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

                            {/* Desktop Float Banner */}
                            {!showSettings && renderFloatBanner()}

                            {showSettings ? renderSettingsBody() : renderChatBody()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Render Portal into Desktop PiP Window (Floating everywhere always-on-top) */}
            {pipWindow && createPortal(
                <div className="w-full min-h-screen flex flex-col justify-between overflow-y-auto no-scrollbar"
                    style={{ background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
                    
                    {/* PiP Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-[var(--bg-main)] z-50">
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-purple-400 animate-pulse" />
                            <span className="font-semibold text-xs text-white">Quick Reply (Desktop)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={() => setShowSettings(!showSettings)}
                                className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-slate-400'}`}
                            >
                                <Settings size={13} />
                            </button>
                            <button 
                                onClick={togglePip}
                                title="Return to Website"
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    </div>

                    {/* PiP Body */}
                    <div className="flex-1 flex flex-col justify-start">
                        {showSettings ? renderSettingsBody() : renderChatBody()}
                    </div>
                </div>,
                pipWindow.document.body
            )}
        </>
    );
};
