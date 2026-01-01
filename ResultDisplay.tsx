
import React, { useState, useRef, useEffect } from 'react';
import type { DataSet } from './types';

interface ResultDisplayProps {
    result: DataSet;
    onMarkHit: (value: string, type: 'Milhar' | 'Centena', position: number, status?: 'Acerto' | 'Quase Acerto') => void;
    onManualRectify: (gen: string, act: string, type: 'Milhar' | 'Centena', rankLabel: string) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onMarkHit, onManualRectify }) => {
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [localVal, setLocalVal] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (openMenu !== null && inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [openMenu]);

    const getRankLabel = (idx: number) => {
        if (idx === 0) return "1º Prêmio (Elite)";
        if (idx === 6) return "7º Prêmio (Centena)";
        return `${idx + 1}º Prêmio`;
    };

    return (
        <div className="bg-slate-900/60 p-4 rounded-[2rem] border border-cyan-900/30 shadow-2xl relative backdrop-blur-xl flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                    <h2 className="text-[10px] font-orbitron font-black text-cyan-400 uppercase tracking-widest leading-none">MATRIZ DE RESSONÂNCIA (M4)</h2>
                </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {result.map((row, idx) => {
                    const value = row.join('');
                    const type = idx === 6 ? 'Centena' : 'Milhar';
                    const isTop = idx < 3;
                    const rankLabel = getRankLabel(idx);
                    
                    return (
                        <div key={idx} className={`group relative p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${isTop ? 'bg-amber-500/5 border-amber-600/30' : 'bg-slate-900/50 border-slate-800/80'}`}>
                            <span className={`text-[7px] font-black mb-1.5 uppercase ${isTop ? 'text-amber-500' : 'text-slate-600'}`}>{idx === 0 ? 'ELITE' : `${idx + 1}º`}</span>
                            <div className={`font-orbitron text-[18px] font-black tracking-tighter leading-none mb-2 ${isTop ? 'text-amber-400' : 'text-slate-100'}`}>{value}</div>

                            <button 
                                onClick={() => { setOpenMenu(idx); setLocalVal(""); }} 
                                className={`p-1.5 rounded-xl relative z-[45] ${isTop ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                            </button>

                            {openMenu === idx && (
                                <div 
                                    onClick={(e) => e.stopPropagation()} 
                                    className="fixed md:absolute top-1/2 left-1/2 md:top-[-20px] md:left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-y-0 w-[90vw] max-w-[230px] bg-slate-950 rounded-[2rem] z-[9999] p-5 flex flex-col gap-3 border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.7)] animate-in zoom-in duration-200"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">REALIDADE IA</span>
                                            <span className="text-[6px] text-slate-500 font-bold uppercase">{rankLabel}</span>
                                        </div>
                                        <button onClick={() => setOpenMenu(null)} className="w-7 h-7 flex items-center justify-center bg-slate-900 rounded-xl text-amber-500 border border-amber-500/50 text-[16px] font-bold">×</button>
                                    </div>
                                    
                                    <input 
                                        ref={inputRef}
                                        type="text" 
                                        placeholder="VALOR REAL" 
                                        value={localVal}
                                        onChange={(e) => setLocalVal(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-slate-900 border border-slate-800 text-center font-orbitron text-[20px] py-3 rounded-2xl text-amber-500 outline-none focus:border-amber-500 placeholder:text-slate-800"
                                        maxLength={idx === 6 ? 3 : 4}
                                        inputMode="numeric"
                                    />
                                    
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => { onMarkHit(value, type, idx + 1, 'Acerto'); setOpenMenu(null); }}
                                            className="w-full bg-amber-500 text-slate-950 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95"
                                        >
                                            SALVAR ACERTO
                                        </button>
                                        <button 
                                            onClick={() => { onMarkHit(value, type, idx + 1, 'Quase Acerto'); setOpenMenu(null); }}
                                            className="w-full bg-slate-900 border border-amber-500/50 text-amber-500 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest active:scale-95"
                                        >
                                            QUASE ACERTO
                                        </button>
                                        <button 
                                            onClick={() => { if (localVal) { onManualRectify(value, localVal, type, rankLabel); setOpenMenu(null); } }}
                                            className="w-full bg-amber-900/40 text-amber-200 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest active:scale-95"
                                        >
                                            SALVAR REALIDADE
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResultDisplay;
