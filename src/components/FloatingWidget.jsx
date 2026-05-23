import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Copy, Check, Loader2, GripVertical, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateReplies } from '../services/ai';

export const FloatingWidget = ({ apiKey }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [replies, setReplies] = useState(null);
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [vibe, setVibe] = useState('Normal');

    // Dragging state
    const [pos, setPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    const [dragging, setDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const bubbleRef = useRef(null);
    const hasDragged = useRef(false);

    const VIBES = [
        { name: 'Normal', emoji: '😐' },
        { name: 'Flirty', emoji: '😘' },
        { name: 'Funny', emoji: '😂' },
        { name: 'Romantic', emoji: '❤️' },
        { name: 'Cold', emoji: '🥶' },
    ];

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

    // --- Generate Logic ---
    const handleGenerate = async () => {
        if (!text.trim() || loading) return;
        setLoading(true);
        setError(null);
        setReplies(null);
        try {
            const result = await generateReplies(apiKey, text, null, 'female', 'replying', vibe, 'en', false);
            setReplies(result.replies);
        } catch (err) {
            setError('Failed to generate. Check your API key in Settings.');
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
        setText('');
        setReplies(null);
        setError(null);
    };

    // Determine popup position (flip if too close to edge)
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
                    {/* Pulse ring */}
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
                        initial={{ opacity: 0, scale: 0.85, y: popupAbove ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: popupAbove ? 10 : -10 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        style={{
                            position: 'fixed',
                            left: popupLeft ? Math.max(pos.x - 320 + 56, 8) : Math.min(pos.x, window.innerWidth - 336),
                            top: popupAbove ? Math.max(pos.y - 420, 8) : pos.y + 68,
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
                                <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Vibe Selector */}
                            <div className="px-4 pt-3 flex gap-1.5 flex-wrap">
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
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                                    placeholder="Paste message here..."
                                    rows={3}
                                    autoFocus
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 resize-none outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                />

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
                                    <p className="text-red-400 text-xs text-center px-2">{error}</p>
                                )}
                            </div>

                            {/* Replies */}
                            <AnimatePresence>
                                {replies && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-t border-white/10 overflow-hidden"
                                    >
                                        <div className="px-4 pt-2 pb-1">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Replies</span>
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
