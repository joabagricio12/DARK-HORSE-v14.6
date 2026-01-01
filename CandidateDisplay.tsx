
import React, { useState, useRef, useEffect } from 'react';
import type { Candidate } from './types';

interface CandidateDisplayProps {
    candidates: Candidate[];
    onMarkHit: (value: string, type: 'Milhar', position: number) => void;
    onManualRectify: (gen: string, act: string, type: 'Milhar', rankLabel: string) => void;
}

const CandidateDisplay: React.FC<CandidateDisplayProps> = ({ candidates, onMarkHit, onManualRectify }) => {
    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const [localVal, setLocalVal] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeIdx !== null && inputRef.current) {
            inputRef.current.focus();
        }
    }, [activeIdx]);

    return (
        <div className="bg-slate-900/80 p-4 rounded-[2rem] border border-slate-800/60 flex flex-col h-full shadow-inner backdrop-blur-md relative">
            <h2 className="text-[8px] font-orbitron font-black text-amber-500 uppercase tracking-[0.3em] mb-4 border-b border-amber-950 pb-2 text-center">REFORÇO ESTRUTURAL (MILHAR)</h2>
            <div className="flex-1 space-y-2.5">
                {candidates.slice(0, 3).map((candidate, index) => {
                    const sequenceStr = candidate.sequence.join('');
                    const rankLabel = `REFORÇO #${index + 1}`;
                    return (
                        <div key={index} className="flex items-center justify-between bg-slate-950/60 p-4 border border-slate-800/80 rounded-[1.5rem] relative">
                            <div className="flex flex-col">
                                <span className="text-[6px] text-amber-600 font-bold mb-1 uppercase tracking-widest">CABEÇA #{index + 1}</span>
                                <span className="font-orbitron text-[22px] font-black text-slate-100 leading-none tracking-widest">{sequenceStr}</span>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveIdx(index); setLocalVal(""); }} 
                                className="bg-slate-800/50 text-slate-400 p-4 rounded-2xl z-[120] border border-slate-700 active:scale-90 shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>

                            {activeIdx === index && (
                                <div 
                                    onClick={(e) => e.stopPropagation()} 
                                    className="fixed md:absolute top-1/2 left-1/2 md:top-0 md:left-auto md:right-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 h-auto min-w-[200px] bg-slate-950 border-2 border-amber-500 rounded-[2.2rem] z-[9999] p-5 flex flex-col gap-4 shadow-[0_0_40px_rgba(245,158,11,0.7)] animate-in slide-in-from-right duration-200"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">AJUSTE REFORÇO</span>
                                            <span className="text-[6px] text-slate-500 font-bold uppercase">{rankLabel}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveIdx(null); }} 
                                            className="w-8 h-8 flex items-center justify-center bg-slate-900 rounded-xl text-amber-500 border border-amber-500/50 text-[18px] font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <input 
                                        ref={inputRef}
                                        type="text" 
                                        placeholder="----"
                                        value={localVal}
                                        onChange={(e) => setLocalVal(e.target.value.replace(/\D/g, ''))}
                                        maxLength={4}
                                        className="w-full bg-slate-900 border border-slate-800 text-center font-orbitron text-[24px] py-3.5 rounded-2xl text-amber-500 outline-none focus:border-amber-500"
                                        inputMode="numeric"
                                    />
                                    
                                    <button 
                                        onClick={() => { if(localVal) { onManualRectify(sequenceStr, localVal, 'Milhar', rankLabel); setActiveIdx(null); } }} 
                                        className="bg-amber-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95"
                                    >
                                        RECALIBRAR
                                    </button>

                                    <div className="w-full h-px bg-slate-800"></div>

                                    <div className="flex justify-between gap-1.5">
                                        {[1, 2, 3, 4, 5].map(pos => (
                                            <button 
                                                key={pos} 
                                                onClick={() => onMarkHit(sequenceStr, 'Milhar', pos)} 
                                                className={`flex-1 h-11 rounded-xl font-black text-[12px] transition-all active:scale-90 ${pos === 1 ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                                            >
                                                {pos}
                                            </button>
                                        ))}
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

export default CandidateDisplay;
