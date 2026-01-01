
import React from 'react';
import PegasusIcon from './PegasusIcon';

interface HeaderProps {
    onOpenHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenHistory }) => {
    return (
        <header className="flex items-center justify-between px-4 py-4 flex-none bg-slate-900/40 border-b border-slate-800/50 rounded-b-[2.5rem] mb-1 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-950/20 rounded-full border border-amber-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                    <PegasusIcon className="h-12 w-12" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-[20px] font-orbitron font-black text-slate-100 uppercase tracking-tighter leading-none">DARK HORSE</h1>
                    <span className="text-[7px] font-orbitron font-bold text-cyan-600 tracking-[0.5em] uppercase opacity-80 mt-1">SISTEMA AUTÔNOMO v12.1</span>
                </div>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={onOpenHistory} 
                    className="p-3 border border-slate-700 bg-slate-800/50 rounded-2xl text-slate-300 hover:text-cyan-400 transition-all active:scale-95 shadow-lg group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
