import React, { useState } from 'react';
import { X, Sparkles, Smile, Heart, Zap, Star, Flame, Skull, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CreateVibeModal = ({ isOpen, onClose, onCreate, t }) => {
    const [vibeName, setVibeName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('✨');

    const EMOJI_OPTIONS = [
        { emoji: '✨', label: 'Sparkle' },
        { emoji: '🔥', label: 'Lit' },
        { emoji: '💀', label: 'Dead' },
        { emoji: '👻', label: 'Ghost' },
        { emoji: '💅', label: 'Sassy' },
        { emoji: '🤡', label: 'Clown' },
        { emoji: '🤠', label: 'Yeehaw' },
        { emoji: '👽', label: 'Alien' },
        { emoji: '🤖', label: 'Robot' },
        { emoji: '💩', label: 'Poop' },
        { emoji: '😈', label: 'Naughty' },
        { emoji: '🥺', label: 'Pleading' },
        { emoji: '😤', label: 'Triumph' },
        { emoji: '🥶', label: 'Cold' },
        { emoji: '🥵', label: 'Hot' },
        { emoji: '🤯', label: 'Mindblown' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (vibeName.trim()) {
            onCreate({ name: vibeName.trim(), emoji: selectedEmoji });
            setVibeName('');
            setSelectedEmoji('✨');
            onClose();
        }
    };

    if (!isOpen) return null;

    const selectedEmojiLabel = EMOJI_OPTIONS.find(e => e.emoji === selectedEmoji)?.label;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md bg-[#1a1b26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold text-white">Create Your Own Vibe</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Vibe Name Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                Vibe Name
                            </label>
                            <input
                                type="text"
                                value={vibeName}
                                onChange={(e) => setVibeName(e.target.value)}
                                placeholder="e.g. Toxic Ex, CEO Mode, Soft Girl..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                autoFocus
                                maxLength={20}
                            />
                        </div>

                        {/* Emoji Selection */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                    Choose an Icon
                                </label>
                                <span className="text-xs text-primary font-medium">{selectedEmojiLabel}</span>
                            </div>
                            <div className="grid grid-cols-8 gap-2">
                                {EMOJI_OPTIONS.map((item) => (
                                    <button
                                        key={item.emoji}
                                        type="button"
                                        onClick={() => setSelectedEmoji(item.emoji)}
                                        title={item.label}
                                        className={`aspect-square flex items-center justify-center text-xl rounded-lg transition-all ${selectedEmoji === item.emoji
                                            ? 'bg-primary/20 border border-primary shadow-[0_0_10px_rgba(139,92,246,0.3)] scale-110'
                                            : 'bg-white/5 border border-transparent hover:bg-white/10 hover:scale-105'
                                            }`}
                                    >
                                        {item.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!vibeName.trim()}
                                className="flex-1 px-4 py-3 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25"
                            >
                                Create Vibe
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
