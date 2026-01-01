
import React, { useState } from 'react';
import type { DataSet, HitRecord, RectificationRecord } from './types';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    inputHistory: DataSet[];
    onClearInputHistory: () => void;
    onDeleteInputItem: (i: number) => void;
    generatedHistory: DataSet[];
    onClearGeneratedHistory: () => void;
    onDeleteGeneratedItem: (i: number) => void;
    hitsHistory: HitRecord[];
    onClearHitsHistory: () => void;
    onDeleteHitItem: (i: number) => void;
    rectificationHistory: RectificationRecord[];
    onClearRectificationHistory: () => void;
    onDeleteRectificationItem: (i: number) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ 
    isOpen, onClose, 
    inputHistory, onClearInputHistory, onDeleteInputItem,
    generatedHistory, onClearGeneratedHistory, onDeleteGeneratedItem,
    hitsHistory, onClearHitsHistory, onDeleteHitItem,
    rectificationHistory, onClearRectificationHistory, onDeleteRectificationItem
}) => {
    const [tab, setTab] = useState('hits');

    if (!isOpen) return null;

    const renderDataSetGrid = (data: DataSet[], onDelete: (i: number) => void) => (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.slice().reverse().map((set, i) => (
                <div key={i} className="bg-slate-900 p-5 border border-slate-800/60 relative group rounded-[2rem] transition-all">
                    <button 
                        onClick={() => onDelete(data.length - 1 - i)}
                        className="absolute top-3 right-3 text-red-600 p-2 hover:bg-red-950/30 transition-all rounded-full"
                    >
                        ×
                    </button>
                    {set.map((row, ri) => (
                        <div key={ri} className={`text-center font-orbitron font-black text-[14px] tracking-widest mb-1.5 ${ri === 0 ? 'text-amber-500' : 'text-slate-600'}`}>
                            {row.join('')}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/98 backdrop-blur-2xl p-4 animate-in fade-in duration-500">
            <div className="bg-slate-900 w-full max-w-4xl h-[94dvh] flex flex-col border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
                
                <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex flex-col">
                        <h2 className="text-[18px] font-orbitron font-black text-slate-100 tracking-tight uppercase leading-none">NÚCLEO DE DADOS</h2>
                        <span className="text-[7px] text-amber-500 font-bold uppercase tracking-[0.5em] mt-2">REGISTROS DE RESSONÂNCIA</span>
                    </div>
                    <button onClick={onClose} className="w-14 h-14 flex items-center justify-center bg-slate-800 text-slate-300 hover:text-white transition-all text-3xl rounded-[1.5rem] border border-slate-700">×</button>
                </div>

                <div className="flex bg-slate-950/30 px-6 pt-6 border-b border-slate-800/50 gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'hits', label: `ACERTOS (${hitsHistory.length})` },
                        { id: 'inputs', label: `ENTRADAS (${inputHistory.length})` },
                        { id: 'rect', label: `AJUSTES IA (${rectificationHistory.length})` }
                    ].map((t) => (
                        <button 
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-none py-4 px-6 font-orbitron font-black text-[9px] tracking-widest uppercase transition-all relative rounded-t-[1.5rem] ${tab === t.id ? 'text-amber-500 bg-slate-900 border-x border-t border-slate-800' : 'text-slate-600 hover:text-slate-300'}`}
                        >
                            {t.label}
                            {tab === t.id && <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b]"></div>}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-slate-950 no-scrollbar">
                    {tab === 'inputs' && renderDataSetGrid(inputHistory, onDeleteInputItem)}
                    
                    {tab === 'hits' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {hitsHistory.slice().reverse().map((hit, i) => (
                                <div key={hit.id} className="bg-slate-900 p-8 border border-slate-800/80 flex flex-col items-center relative group rounded-[2.5rem] hover:border-amber-500/30 transition-all">
                                    <button onClick={() => onDeleteHitItem(hitsHistory.length - 1 - i)} className="absolute top-4 right-4 text-slate-700 hover:text-red-500 text-3xl">×</button>
                                    <div className={`px-5 py-1.5 ${hit.status === 'Acerto' ? 'bg-green-950/40 text-green-400' : 'bg-amber-950/40 text-amber-500'} text-[8px] font-black uppercase tracking-[0.2em] mb-4 rounded-full border border-current/30`}>
                                        {hit.status} — RANK {hit.position}º
                                    </div>
                                    <div className="font-orbitron text-4xl font-black text-slate-100 tracking-[0.25em]">{hit.value}</div>
                                    <div className="text-[6px] text-slate-600 mt-2 font-black uppercase tracking-widest">{hit.type}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'rect' && (
                        <div className="space-y-4">
                            {rectificationHistory.slice().reverse().map((rec, i) => (
                                <div key={rec.id} className="bg-slate-900 p-6 border border-slate-800/60 flex flex-col gap-4 group rounded-[2.5rem] hover:border-amber-500/30 transition-all">
                                    <div className="flex justify-between items-center px-4">
                                        <div className="text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-950/20 px-4 py-1.5 rounded-full border border-amber-500/20">
                                            {rec.rankLabel} — {rec.type}
                                        </div>
                                        <button onClick={() => onDeleteRectificationItem(rectificationHistory.length - 1 - i)} className="text-slate-700 hover:text-red-500 text-2xl transition-all">×</button>
                                    </div>
                                    <div className="flex items-center justify-between px-6">
                                        <div className="flex-1 text-center">
                                            <div className="text-[7px] text-slate-600 font-bold uppercase mb-2 tracking-widest">IA SUGERIU</div>
                                            <div className="font-orbitron text-slate-700 line-through text-[16px]">{rec.generated}</div>
                                        </div>
                                        <div className="px-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <div className="text-[7px] text-amber-500 font-bold uppercase mb-2 tracking-widest">FATO REAL</div>
                                            <div className="font-orbitron text-[22px] text-slate-100 font-black tracking-[0.1em]">{rec.actual}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-950/80 border-t border-slate-800">
                    <button 
                        onClick={() => {
                            if (window.confirm('WIPE DATA: Confirmar limpeza total desta categoria?')) {
                                if (tab === 'inputs') onClearInputHistory();
                                if (tab === 'hits') onClearHitsHistory();
                                if (tab === 'rect') onClearRectificationHistory();
                            }
                        }} 
                        className="w-full text-red-600 font-orbitron font-black text-[10px] tracking-[0.4em] uppercase py-4 border border-red-900/20 hover:bg-red-950/10 transition-all rounded-[2rem]"
                    >
                        LIMPAR REGISTROS SELECIONADOS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
