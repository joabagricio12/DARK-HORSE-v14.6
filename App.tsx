
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { DataSet, Candidate, AdvancedPredictions, HitRecord, CombinedAnalysis, RectificationRecord, AppSettings } from './types';
import Header from './Header';
import ModuleInput from './ModuleInput';
import ResultDisplay from './ResultDisplay';
import CandidateDisplay from './CandidateDisplay';
import AdvancedPredictionDisplay from './AdvancedPredictionDisplay';
import StatisticsDisplay from './StatisticsDisplay';
import HistoryModal from './HistoryModal';
import { runGenerationCycle, parseModules } from './analysisService';
import { INITIAL_HISTORY } from './initialData';

const App: React.FC = () => {
    // Persistence initialization
    const [inputHistory, setInputHistory] = useState<DataSet[]>(() => {
        const saved = localStorage.getItem('dh_input_v14_6');
        return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    });
    const [hitsHistory, setHitsHistory] = useState<HitRecord[]>(() => JSON.parse(localStorage.getItem('dh_hits_v14_6') || '[]'));
    const [generatedHistory, setGeneratedHistory] = useState<DataSet[]>(() => JSON.parse(localStorage.getItem('dh_gen_v14_6') || '[]'));
    const [rectificationHistory, setRectificationHistory] = useState<RectificationRecord[]>(() => JSON.parse(localStorage.getItem('dh_rect_v14_6') || '[]'));
    const [settings, setSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('dh_settings_v14_6') || '{"entropy": 0.5, "voiceEnabled": false}'));

    const [m1, setM1] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_m1_v14_6') || '["","","","","","",""]'));
    const [m2, setM2] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_m2_v14_6') || '["","","","","","",""]'));
    const [m3, setM3] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_m3_v14_6') || '["","","","","","",""]'));

    const [generatedResult, setGeneratedResult] = useState<DataSet | null>(null);
    const [candidates, setCandidates] = useState<Candidate[] | null>(null);
    const [advancedPredictions, setAdvancedPredictions] = useState<AdvancedPredictions | null>(null);
    const [analysisData, setAnalysisData] = useState<CombinedAnalysis | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    const undoStack = useRef<string[][]>([]);

    // Continuous Persistence Effect
    useEffect(() => {
        localStorage.setItem('dh_input_v14_6', JSON.stringify(inputHistory));
        localStorage.setItem('dh_hits_v14_6', JSON.stringify(hitsHistory));
        localStorage.setItem('dh_gen_v14_6', JSON.stringify(generatedHistory));
        localStorage.setItem('dh_rect_v14_6', JSON.stringify(rectificationHistory));
        localStorage.setItem('dh_settings_v14_6', JSON.stringify(settings));
        localStorage.setItem('dh_m1_v14_6', JSON.stringify(m1));
        localStorage.setItem('dh_m2_v14_6', JSON.stringify(m2));
        localStorage.setItem('dh_m3_v14_6', JSON.stringify(m3));
    }, [inputHistory, hitsHistory, generatedHistory, rectificationHistory, settings, m1, m2, m3]);

    const handleMarkHit = useCallback((value: string, type: 'Milhar' | 'Centena' | 'Dezena', pos: number, status: 'Acerto' | 'Quase Acerto' = 'Acerto') => {
        const newHit: HitRecord = { 
            id: crypto.randomUUID(), 
            value, 
            type, 
            status,
            position: pos, 
            timestamp: Date.now() 
        };
        setHitsHistory(prev => [newHit, ...prev].slice(0, 100));
        setNotification(`${status.toUpperCase()}: ${value} (Rank ${pos})`);
        setTimeout(() => setNotification(null), 2500);
    }, []);

    const handleManualRectify = useCallback((gen: string, act: string, type: 'Milhar' | 'Centena' | 'Dezena', rankLabel: string) => {
        if (!act || act.length < 2) return;
        const newRec: RectificationRecord = {
            id: crypto.randomUUID(),
            type,
            generated: gen,
            actual: act,
            rankLabel,
            timestamp: Date.now()
        };
        setRectificationHistory(prev => [newRec, ...prev].slice(0, 100));
        setNotification(`REALIDADE SALVA: ${act}`);
        setTimeout(() => setNotification(null), 2500);
    }, []);

    const handleGenerate = () => {
        if (isLoading) return;
        setIsLoading(true);
        const parsed = parseModules([m1, m2, m3]);
        setTimeout(() => {
            const res = runGenerationCycle(parsed.modules, inputHistory, hitsHistory, rectificationHistory, settings.entropy);
            setGeneratedResult(res.result);
            setCandidates(res.candidates);
            setAdvancedPredictions(res.advancedPredictions);
            setAnalysisData(res.analysis);
            setGeneratedHistory(prev => [res.result, ...prev].slice(0, 50));
            setIsLoading(false);
        }, 1500);
    };

    const handlePasteM3 = (v: string[]) => {
        undoStack.current.push([...m3]);
        setM1(m2); 
        setM2(m3); 
        setM3(v);
        setInputHistory(prev => [...prev, v.map(l => l.split('').map(Number))].slice(-100));
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-slate-950 px-3 pt-2 pb-12 gap-3 text-slate-100 no-scrollbar overflow-y-auto">
            {notification && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-slate-950 border-2 border-amber-500 text-amber-500 px-8 py-4 font-orbitron font-black text-[10px] rounded-[2rem] shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-bounce text-center uppercase tracking-widest">
                    {notification}
                </div>
            )}
            
            <Header onOpenHistory={() => setIsHistoryOpen(true)} />
            
            <div className="bg-slate-900/40 p-3 rounded-[1.5rem] border border-slate-800/60 flex flex-col gap-2 shadow-inner">
                <div className="flex justify-between items-center px-1">
                   <span className="text-[7px] font-orbitron font-bold text-slate-500 uppercase tracking-widest">ENTROPIA DE ANÁLISE</span>
                   <span className="text-[9px] font-orbitron font-black text-amber-500">{(settings.entropy * 100).toFixed(0)}%</span>
                </div>
                <input 
                    type="range" min="0" max="1" step="0.05" value={settings.entropy}
                    onChange={(e) => setSettings({...settings, entropy: parseFloat(e.target.value)})}
                    className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div className="module-grid">
                <ModuleInput id="1" title="HISTÓRICO I" values={m1} setValues={setM1} readOnly />
                <ModuleInput id="2" title="HISTÓRICO II" values={m2} setValues={setM2} readOnly />
                <ModuleInput 
                    id="3" 
                    title="ATUAL" 
                    values={m3} 
                    setValues={setM3} 
                    onPaste={handlePasteM3} 
                    onClear={() => setM3(Array(7).fill(""))}
                    onUndo={() => { if(undoStack.current.length > 0) setM3(undoStack.current.pop()!) }}
                />
            </div>

            <button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className={`w-full py-5 font-orbitron font-black rounded-[1.5rem] uppercase tracking-widest transition-all shadow-lg border-2 ${
                    isLoading 
                    ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-slate-900 border-amber-600 text-amber-500 active:scale-95'
                }`}
            >
                {isLoading ? 'CALIBRANDO MATRIZ...' : 'EXECUTAR ANÁLISE'}
            </button>

            {(generatedResult || isLoading) && (
                <div className="flex flex-col gap-3">
                    <StatisticsDisplay analysis={analysisData} isLoading={isLoading} />
                    {generatedResult && (
                        <>
                            <ResultDisplay result={generatedResult} onMarkHit={handleMarkHit} onManualRectify={handleManualRectify} />
                            {advancedPredictions && <AdvancedPredictionDisplay predictions={advancedPredictions} onMarkHit={handleMarkHit} onManualRectify={handleManualRectify} />}
                            {candidates && <CandidateDisplay candidates={candidates} onMarkHit={handleMarkHit} onManualRectify={handleManualRectify} />}
                        </>
                    )}
                </div>
            )}

            <HistoryModal 
                isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} 
                inputHistory={inputHistory} onClearInputHistory={() => setInputHistory([])} onDeleteInputItem={(i) => setInputHistory(prev => prev.filter((_, idx) => idx !== i))}
                generatedHistory={generatedHistory} onClearGeneratedHistory={() => setGeneratedHistory([])} onDeleteGeneratedItem={(i) => setGeneratedHistory(prev => prev.filter((_, idx) => idx !== i))}
                hitsHistory={hitsHistory} onClearHitsHistory={() => setHitsHistory([])} onDeleteHitItem={(i) => setHitsHistory(prev => prev.filter((_, idx) => idx !== i))}
                rectificationHistory={rectificationHistory} onClearRectificationHistory={() => setRectificationHistory([])} onDeleteRectificationItem={(i) => setRectificationHistory(prev => prev.filter((_, idx) => idx !== i))}
            />
        </div>
    );
};

export default App;
