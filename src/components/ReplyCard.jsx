import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export const ReplyCard = ({ tone, emoji, content, delay, t }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="group relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 transition-all duration-300 hover:shadow-lg backdrop-blur-md"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-xl text-[var(--text-main)]">
                        {emoji || '✨'}
                    </div>
                    <div>
                        <h3 className="text-[var(--text-main)] font-semibold text-lg">{tone}</h3>
                        <span className="text-[var(--text-secondary)] text-xs">AI Suggestion</span>
                    </div>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-full hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
            </div>

            <div className="text-[var(--text-main)] leading-relaxed font-light text-[15px] opacity-90">
                <ReactMarkdown
                    components={{
                        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>

            {/* Hover Glow - Subtle in all themes, or only premium? Let's keep it subtle everywhere or use CSS var */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
};
