import React, { useEffect } from 'react';

const Layout = ({ children, theme }) => {
    // Apply theme to document root
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Glows - Only visible in Premium theme */}
            {theme === 'premium' && (
                <>
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none z-0" />
                </>
            )}

            {/* Main Content */}
            <main className="relative z-10 flex-1 w-full max-w-xl mx-auto px-6 py-8 flex flex-col">
                {children}
            </main>
        </div>
    );
};

export default Layout;
