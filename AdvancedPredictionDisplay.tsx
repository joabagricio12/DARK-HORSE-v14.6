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

const PositionMenu: React.FC<PositionMenuProps> = ({ 
    value, type, label, localRect, onLocalRectChange, onClose, onManualRectify, onMarkHit 
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedPos, setSelectedPos] = useState(1);

    useEffect(() => {
        if (inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div 
            onClick={(e) => e.stopPropagation()} 
            className="fixed md:absolute top-1/2 left-1/2 md:top-full md:left-auto md:right-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 mt-2 bg-slate-950 border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.8)] p-6 z-[9999] flex flex-col gap-4 min-w-[240px] rounded-[2.2rem] animate-in zoom-in duration-200"
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">RETIFICAR IA</span>
                    <span className="text-[7px] text-slate-500 font-bold uppercase">{label}</span>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-900 rounded-xl text-amber-500 border border-amber-500/50 text-[18px] font-bold">×</button>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map(p => (
                    <button 
                        key={p} 
                        onClick={() => setSelectedPos(p)}
                        className={`h-10 rounded-xl text-[12px] font-black border transition-all ${selectedPos === p ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                    >
                        {p}º
                    </button>
                ))}
            </div>
            
            <input 
                ref={inputRef}
                type="text" 
                placeholder="VALOR REAL"
                value={localRect}
                onChange={(e) => onLocalRectChange(e.target.value.replace(/\D/g, ''))}
                maxLength={type === 'Centena' ? 3 : 2}
                className="w-full bg-slate-900 border border-slate-800 text-center font-orbitron text-[22px] py-3 rounded-2xl text-amber-500 outline-none focus:border-amber-500 placeholder:text-slate-800"
                inputMode="numeric"
            />
            
            <div className="flex flex-col gap-2">
                <button 
                    onClick={() => { onMarkHit(value, type, selectedPos, 'Acerto'); onClose(); }}
                    className="w-full bg-amber-500 text-slate-950 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95"
                >
                    SALVAR ACERTO
                </button>
                <button 
                    onClick={() => { onMarkHit(value, type, selectedPos, 'Quase Acerto'); onClose(); }}
                    className="w-full bg-slate-900 border border-amber-500/50 text-amber-500 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest active:scale-95"
                >
                    QUASE ACERTO
                </button>
                <button 
                    onClick={() => { if(localRect) { onManualRectify(value, localRect, type, `${selectedPos}º PRÊMIO`); onClose(); } }}
                    className="w-full bg-amber-900/40 text-amber-200 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest active:scale-95"
                >
                    SALVAR REALIDADE
                </button>
            </div>
        </div>
    );
};

const AdvancedPredictionDisplay: React.FC<AdvancedPredictionDisplayProps> = ({ predictions, onMarkHit, onManualRectify }) => {
    const [activeMenu, setActiveMenu] = useState<{ id: string, type: 'Centena' | 'Dezena', val: string, label: string } | null>(null);
    const [localRect, setLocalRect] = useState("");

    return (
        <div className="flex flex-col gap-4 h-full relative">
            {/* SEÇÃO ELITE COM DESTAQUE NEON ÂMBAR ULTRA INTENSO */}
            <div className="bg-slate-900 rounded-[2.5rem] border-2 border-amber-500 relative z-[40] shadow-[0_0_40px_rgba(245,158,11,0.5)] overflow-hidden">
                <div className="bg-slate-950/80 p-5 rounded-[2.4rem] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.15),transparent)] pointer-events-none"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                    
                    <h2 className="text-[11px] font-orbitron font-black text-amber-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2 justify-center">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b] animate-pulse"></span>
                        DEZENAS ELITE
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {predictions.eliteTens.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center bg-gradient-to-b from-amber-500/10 to-transparent p-5 border border-amber-500/20 rounded-[2.2rem] relative">
                                <span className="font-orbitron text-[36px] text-amber-400 font-black mb-3 tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">{item.value}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveMenu({ id: `elite-${idx}`, type: 'Dezena', val: item.value, label: 'ELITE 1º PRÊMIO' }); setLocalRect(""); }} 
                                    className="w-full bg-amber-500 text-slate-950 py-3 rounded-xl text-[10px] font-black uppercase shadow-[0_4px_0_#b45309] active:translate-y-[2px] active:shadow-none transition-all"
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
                                className="p-3 bg-slate-800 text-slate-400 rounded-xl border border-slate-700 active:scale-90"
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
                                className="p-4 bg-slate-800 text-slate-400 rounded-2xl border border-slate-700 active:scale-90"
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