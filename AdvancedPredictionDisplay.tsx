
import React, { useState, useRef, useEffect } from 'react';
import type { AdvancedPredictions } from './types';

interface PositionMenuProps {
    value: string;
    type: 'Centena' | 'Dezena';
    label: string;
    localRect: string;
    onLocalRectChange: (val: string) => void;
    onClose: () => void;
    onManualRectify: (gen: string, act: string, type: 'Centena' | 'Dezena', rankLabel: string) => void;
    onMarkHit: (value: string, type: 'Centena' | 'Dezena', position: number, status?: 'Acerto' | 'Quase Acerto') => void;
}

interface AdvancedPredictionDisplayProps {
    predictions: AdvancedPredictions;
    onMarkHit: (value: string, type: 'Centena' | 'Dezena', position: number, status?: 'Acerto' | 'Quase Acerto') => void;
    onManualRectify: (gen: string, act: string, type: 'Centena' | 'Dezena', rankLabel: string) => void;
}

// PositionMenu is externalized to ensure that input focus is not lost during state updates in mobile devices.
const PositionMenu: React.FC<PositionMenuProps> = ({ 
    value, type, label, localRect, onLocalRectChange, onClose, onManualRectify, onMarkHit 
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            // Small delay for mobile browsers to ensure the keyboard pops up correctly
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div 
            onClick={(e) => e.stopPropagation()} 
            className="fixed md:absolute top-1/2 left-1/2 md:top-full md:left-auto md:right-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 mt-2 bg-slate-950 border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.7)] p-6 z-[9999] flex flex-col gap-4 min-w-[220px] rounded-[2.2rem] animate-in zoom-in duration-200"
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">RETIFICAR IA</span>
                    <span className="text-[6px] text-slate-500 font-bold uppercase">{label}</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onClose(); }} 
                    className="w-8 h-8 flex items-center justify-center bg-slate-900 rounded-xl text-amber-500 border border-amber-500/50 text-[18px] font-bold"
                >
                    ×
                </button>
            </div>
            
            <input 
                ref={inputRef}
                type="text" 
                placeholder="--"
                value={localRect}
                onChange={(e) => onLocalRectChange(e.target.value.replace(/\D/g, ''))}
                maxLength={type === 'Centena' ? 3 : 2}
                className="w-full bg-slate-900 border border-slate-800 text-center font-orbitron text-[24px] py-3.5 rounded-2xl text-amber-500 outline-none focus:border-amber-500"
                inputMode="numeric"
            />
            
            <button 
                onClick={() => { if(localRect) { onManualRectify(value, localRect, type, label); onClose(); } }}
                className="w-full bg-amber-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95"
            >
                SALVAR REALIDADE
            </button>

            <div className="w-full h-px bg-slate-800"></div>

            <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((pos) => (
                    <button 
                        key={pos} 
                        onClick={() => onMarkHit(value, type, pos, 'Acerto')} 
                        className={`h-11 rounded-xl font-orbitron font-black text-[13px] transition-all active:scale-90 ${pos === 1 ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}
                    >
                        {pos}
                    </button>
                ))}
            </div>
            <button 
                onClick={() => onMarkHit(value, type, 1, 'Quase Acerto')}
                className="w-full py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-[8px] font-black text-slate-400 uppercase tracking-widest"
            >
                MARCAR QUASE ACERTO
            </button>
        </div>
    );
};

const AdvancedPredictionDisplay: React.FC<AdvancedPredictionDisplayProps> = ({ predictions, onMarkHit, onManualRectify }) => {
    const [activeMenu, setActiveMenu] = useState<{ id: string, type: 'Centena' | 'Dezena', val: string, label: string } | null>(null);
    const [localRect, setLocalRect] = useState("");

    return (
        <div className="flex flex-col gap-4 h-full relative">
            {/* SEÇÃO ELITE COM DESTAQUE NEON ÂMBAR INTENSO */}
            <div className="bg-slate-900 rounded-[2.5rem] border-2 border-amber-500/80 relative z-[40] shadow-[0_0_30px_rgba(245,158,11,0.35)] overflow-hidden">
                <div className="bg-slate-950/60 p-5 rounded-[2.4rem] relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent blur-[1px]"></div>
                    
                    <h2 className="text-[10px] font-orbitron font-black text-amber-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2 justify-center">
                        <span className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b] animate-pulse"></span>
                        DEZENAS ELITE
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {predictions.eliteTens.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center bg-gradient-to-b from-amber-500/10 to-transparent p-5 border border-amber-500/30 rounded-[2.2rem] relative shadow-inner">
                                <span className="font-orbitron text-[34px] text-amber-400 font-black mb-3 tracking-tighter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{item.value}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveMenu({ id: `elite-${idx}`, type: 'Dezena', val: item.value, label: 'ELITE 1º PRÊMIO' }); setLocalRect(""); }} 
                                    className="w-full bg-amber-500 text-slate-950 py-3 rounded-xl text-[11px] font-black uppercase z-[160] shadow-[0_4px_0_#b45309] active:translate-y-[2px] active:shadow-none transition-all"
                                >
                                    MARCAR
                                </button>
                                {activeMenu?.id === `elite-${idx}` && (
                                    <PositionMenu 
                                        value={item.value} 
                                        type="Dezena" 
                                        label={activeMenu.label}
                                        localRect={localRect}
                                        onLocalRectChange={setLocalRect}
                                        onClose={() => setActiveMenu(null)}
                                        onManualRectify={onManualRectify}
                                        onMarkHit={onMarkHit}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TRÍADE DEZENAS */}
            <div className={`bg-slate-900/60 p-5 rounded-[2.5rem] border border-slate-800/60 backdrop-blur-xl relative transition-all ${activeMenu?.id.includes('triad-d') ? 'z-[999]' : 'z-[30]'}`}>
                <h2 className="text-[8px] font-orbitron font-black text-slate-500 mb-4 uppercase tracking-[0.2em] text-center">TRÍADE DEZENAS</h2>
                <div className="grid grid-cols-3 gap-2">
                    {predictions.superTens.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center bg-slate-950/60 p-3 rounded-[1.8rem] relative">
                            <span className="font-orbitron text-[22px] text-slate-100 font-black mb-3 tracking-tight">{item.value}</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenu({ id: `triad-d-${idx}`, type: 'Dezena', val: item.value, label: 'TRÍADE DEZENA' }); setLocalRect(""); }} 
                                className="p-3 bg-slate-800 text-slate-400 rounded-xl z-[160] border border-slate-700 hover:text-cyan-400 shadow-md active:scale-90"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                            {activeMenu?.id === `triad-d-${idx}` && (
                                <PositionMenu 
                                    value={item.value} 
                                    type="Dezena" 
                                    label={activeMenu.label}
                                    localRect={localRect}
                                    onLocalRectChange={setLocalRect}
                                    onClose={() => setActiveMenu(null)}
                                    onManualRectify={onManualRectify}
                                    onMarkHit={onMarkHit}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* TRÍADE CENTENAS */}
            <div className={`bg-slate-900/60 p-5 rounded-[2.5rem] border border-slate-800/60 backdrop-blur-xl flex-1 relative transition-all ${activeMenu?.id.includes('triad-c') ? 'z-[999]' : 'z-[20]'}`}>
                <h2 className="text-[8px] font-orbitron font-black text-slate-500 mb-4 uppercase tracking-[0.2em] text-center">TRÍADE CENTENAS</h2>
                <div className="space-y-2">
                    {predictions.hundreds.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950/60 p-4 rounded-[1.8rem] relative border border-slate-800/40">
                            <span className="font-orbitron text-[22px] text-slate-100 font-black tracking-[0.2em]">{item.value}</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenu({ id: `triad-c-${idx}`, type: 'Centena', val: item.value, label: 'TRÍADE CENTENA' }); setLocalRect(""); }} 
                                className="p-4 bg-slate-800 text-slate-400 rounded-2xl z-[160] border border-slate-700 hover:text-cyan-400 shadow-lg active:scale-90"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                            {activeMenu?.id === `triad-c-${idx}` && (
                                <PositionMenu 
                                    value={item.value} 
                                    type="Centena" 
                                    label={activeMenu.label}
                                    localRect={localRect}
                                    onLocalRectChange={setLocalRect}
                                    onClose={() => setActiveMenu(null)}
                                    onManualRectify={onManualRectify}
                                    onMarkHit={onMarkHit}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvancedPredictionDisplay;
