
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
    // Configurações de Ciclo de Limpeza (999 limite -> remove 20 mais antigos)
    const MAX_RECORDS = 999;
    const CLEANUP_AMOUNT = 20;

    const maintainLimit = <T,>(arr: T[], newItem: T, isNewAtStart: boolean = true): T[] => {
        const combined = isNewAtStart ? [newItem, ...arr] : [...arr, newItem];
        if (combined.length >= MAX_RECORDS) {
            // Se atingiu 999, remove os 20 mais antigos (os da ponta oposta ao novo item)
            const targetSize = MAX_RECORDS - CLEANUP_AMOUNT;
            return isNewAtStart ? combined.slice(0, targetSize) : combined.slice(-targetSize);
        }
        return combined;
    };

    // Persistência Total v14.8 (Senior Engine High-Precision)
    const [inputHistory, setInputHistory] = useState<DataSet[]>(() => {
        const saved = localStorage.getItem('dh_input_v14_8');
        return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    });
    const [hitsHistory, setHitsHistory] = useState<HitRecord[]>(() => JSON.parse(localStorage.getItem('dh_hits_v14_8') || '[]'));
    const [generatedHistory, setGeneratedHistory] = useState<DataSet[]>(() => JSON.parse(localStorage.getItem('dh_gen_v14_8') || '[]'));
    const [rectificationHistory, setRectificationHistory] = useState<RectificationRecord[]>(() => JSON.parse(localStorage.getItem('dh_rect_v14_8') || '[]'));
    const [settings, setSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('dh_settings_v14_8') || '{"entropy": 0.5, "voiceEnabled": false}'));

    const [m1, setM1] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_m1_v14_8') || '["","","","","","",""]'));
    const [m2, setM2] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_m2_v14_8') || '["","","","","","",""]'));
    const [m3, setM3] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_m3_v14_8') || '["","","","","","",""]'));

    const [generatedResult, setGeneratedResult] = useState<DataSet | null>(() => {
        const saved = localStorage.getItem('dh_last_gen_v14_8');
        return saved ? JSON.parse(saved) : null;
    });
    
    const [candidates, setCandidates] = useState<Candidate[] | null>(null);
    const [advancedPredictions, setAdvancedPredictions] = useState<AdvancedPredictions | null>(null);
    const [analysisData, setAnalysisData] = useState<CombinedAnalysis | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(() => localStorage.getItem('dh_btn_lock_v14_8') === 'true');

    const undoStack = useRef<string[][]>([]);

    // Sincronização e Persistência de Dados
    useEffect(() => {
        localStorage.setItem('dh_input_v14_8', JSON.stringify(inputHistory));
        localStorage.setItem('dh_hits_v14_7', JSON.stringify(hitsHistory));
        localStorage.setItem('dh_gen_v14_7', JSON.stringify(generatedHistory));
        localStorage.setItem('dh_rect_v14_7', JSON.stringify(rectificationHistory));
        localStorage.setItem('dh_settings_v14_8', JSON.stringify(settings));
        localStorage.setItem('dh_m1_v14_8', JSON.stringify(m1));
        localStorage.setItem('dh_m2_v14_8', JSON.stringify(m2));
        localStorage.setItem('dh_m3_v14_8', JSON.stringify(m3));
        localStorage.setItem('dh_btn_lock_v14_8', isLocked.toString());
        if (generatedResult) localStorage.setItem('dh_last_gen_v14_8', JSON.stringify(generatedResult));
    }, [inputHistory, hitsHistory, generatedHistory, rectificationHistory, settings, m1, m2, m3, isLocked, generatedResult]);

    // Comparação Automática de Resultados (Foco IA Sênior)
    const autoCompareResults = useCallback((currentM3: string[]) => {
        if (!generatedResult) return;
        
        const automatedHits: HitRecord[] = [];
        currentM3.forEach((actualValue, idx) => {
            if (!actualValue || actualValue.length < 3) return;
            const predictedValue = generatedResult[idx].join('');
            
            if (actualValue === predictedValue) {
                automatedHits.push({
                    id: crypto.randomUUID(),
                    value: actualValue,
                    type: idx === 6 ? 'Centena' : 'Milhar',
                    status: 'Acerto',
                    position: idx + 1,
                    timestamp: Date.now()
                });
            } else if (actualValue.split('').sort().join('') === predictedValue.split('').sort().join('')) {
                automatedHits.push({
                    id: crypto.randomUUID(),
                    value: actualValue,
                    type: idx === 6 ? 'Centena' : 'Milhar',
                    status: 'Quase Acerto',
                    position: idx + 1,
                    timestamp: Date.now()
                });
            }
        });

        if (automatedHits.length > 0) {
            setHitsHistory(prev => {
                let current = prev;
                automatedHits.forEach(hit => {
                    current = maintainLimit(current, hit, true);
                });
                return current;
            });
            setNotification(`IA SYNC: ${automatedHits.length} NOVOS PADRÕES`);
            setTimeout(() => setNotification(null), 3000);
        }
    }, [generatedResult]);

    const handleMarkHit = useCallback((value: string, type: 'Milhar' | 'Centena' | 'Dezena', pos: number, status: 'Acerto' | 'Quase Acerto' = 'Acerto') => {
        const newHit: HitRecord = { 
            id: crypto.randomUUID(), 
            value, 
            type, 
            status,
            position: pos, 
            timestamp: Date.now() 
        };
        setHitsHistory(prev => maintainLimit(prev, newHit, true));
        setNotification(`${status.toUpperCase()}: ${value} (Pos: ${pos})`);
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
        setRectificationHistory(prev => maintainLimit(prev, newRec, true));
        setNotification(`SISTEMA CALIBRADO: ${act}`);
        setTimeout(() => setNotification(null), 2500);
    }, []);

    const handleGenerate = () => {
        if (isLoading || isLocked) return;
        setIsLoading(true);
        const parsed = parseModules([m1, m2, m3]);
        setTimeout(() => {
            const res = runGenerationCycle(parsed.modules, inputHistory, hitsHistory, rectificationHistory, settings.entropy);
            setGeneratedResult(res.result);
            setCandidates(res.candidates);
            setAdvancedPredictions(res.advancedPredictions);
            setAnalysisData(res.analysis);
            setGeneratedHistory(prev => maintainLimit(prev, res.result, true));
            setIsLoading(false);
            setIsLocked(true); 
        }, 1500);
    };

    const handleM3Change = (v: string[]) => {
        if (isLocked) {
            autoCompareResults(v);
            setIsLocked(false); 
        }
        setM3(v);
    };

    const handlePasteM3 = (v: string[]) => {
        undoStack.current.push([...m3]);
        autoCompareResults(v);
        setM1(m2); 
        setM2(m3); 
        setM3(v);
        setInputHistory(prev => maintainLimit(prev, v.map(l => l.split('').map(Number)), false));
        setIsLocked(false); 
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
                    setValues={handleM3Change} 
                    onPaste={handlePasteM3} 
                    onClear={() => { setM3(Array(7).fill("")); setIsLocked(false); }}
                    onUndo={() => { if(undoStack.current.length > 0) { setM3(undoStack.current.pop()!); setIsLocked(false); } }}
                />
            </div>

            <button 
                onClick={handleGenerate} 
                disabled={isLoading || isLocked}
                className={`w-full py-5 font-orbitron font-black rounded-[1.5rem] uppercase tracking-widest transition-all shadow-lg border-2 ${
                    isLoading || isLocked
                    ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-slate-900 border-amber-600 text-amber-500 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                }`}
            >
                {isLoading ? 'SINCRONIZANDO...' : isLocked ? 'BLOQUEADO: ATUALIZE M3' : 'EXECUTAR ANÁLISE SÊNIOR'}
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
