
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
    const MAX_RECORDS = 999;
    const CLEANUP_AMOUNT = 20;

    const maintainLimit = <T,>(arr: T[], newItem: T, isNewAtStart: boolean = true): T[] => {
        const combined = isNewAtStart ? [newItem, ...arr] : [...arr, newItem];
        if (combined.length >= MAX_RECORDS) {
            const targetSize = MAX_RECORDS - CLEANUP_AMOUNT;
            return isNewAtStart ? combined.slice(0, targetSize) : combined.slice(-targetSize);
        }
        return combined;
    };

    // Estados com Persistência Restaurada v15.0
    const [inputHistory, setInputHistory] = useState<DataSet[]>(() => {
        const saved = localStorage.getItem('dh_input_v15');
        return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    });
    const [hitsHistory, setHitsHistory] = useState<HitRecord[]>(() => JSON.parse(localStorage.getItem('dh_hits_v15') || '[]'));
    const [generatedHistory, setGeneratedHistory] = useState<DataSet[]>(() => JSON.parse(localStorage.getItem('dh_gen_v15') || '[]'));
    const [rectificationHistory, setRectificationHistory] = useState<RectificationRecord[]>(() => JSON.parse(localStorage.getItem('dh_rect_v15') || '[]'));
    const [settings, setSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('dh_settings_v15') || '{"entropy": 0.5, "voiceEnabled": false}'));

    const [m1, setM1] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_m1_v15') || '["","","","","","",""]'));
    const [m2, setM2] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_m2_v15') || '["","","","","","",""]'));
    const [m3, setM3] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_m3_v15') || '["","","","","","",""]'));

    // Recuperação de predições para evitar desaparecimento
    const [generatedResult, setGeneratedResult] = useState<DataSet | null>(() => {
        const saved = localStorage.getItem('dh_last_gen_v15');
        return saved ? JSON.parse(saved) : null;
    });
    const [candidates, setCandidates] = useState<Candidate[] | null>(() => {
        const saved = localStorage.getItem('dh_last_cand_v15');
        return saved ? JSON.parse(saved) : null;
    });
    const [advancedPredictions, setAdvancedPredictions] = useState<AdvancedPredictions | null>(() => {
        const saved = localStorage.getItem('dh_last_adv_v15');
        return saved ? JSON.parse(saved) : null;
    });
    const [analysisData, setAnalysisData] = useState<CombinedAnalysis | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(() => localStorage.getItem('dh_btn_lock_v15') === 'true');

    const undoStack = useRef<string[][]>([]);

    // Efeito de Persistência Unificado
    useEffect(() => {
        localStorage.setItem('dh_input_v15', JSON.stringify(inputHistory));
        localStorage.setItem('dh_hits_v15', JSON.stringify(hitsHistory));
        localStorage.setItem('dh_gen_v15', JSON.stringify(generatedHistory));
        localStorage.setItem('dh_rect_v15', JSON.stringify(rectificationHistory));
        localStorage.setItem('dh_settings_v15', JSON.stringify(settings));
        localStorage.setItem('dh_m1_v15', JSON.stringify(m1));
        localStorage.setItem('dh_m2_v15', JSON.stringify(m2));
        localStorage.setItem('dh_m3_v15', JSON.stringify(m3));
        localStorage.setItem('dh_btn_lock_v15', isLocked.toString());
        if (generatedResult) localStorage.setItem('dh_last_gen_v15', JSON.stringify(generatedResult));
        if (candidates) localStorage.setItem('dh_last_cand_v15', JSON.stringify(candidates));
        if (advancedPredictions) localStorage.setItem('dh_last_adv_v15', JSON.stringify(advancedPredictions));
    }, [inputHistory, hitsHistory, generatedHistory, rectificationHistory, settings, m1, m2, m3, isLocked, generatedResult, candidates, advancedPredictions]);

    // Comparação Automática Instantânea
    const processInstantSync = useCallback((realData: string[], predictions: DataSet | null) => {
        if (!predictions) return;
        
        const newHits: HitRecord[] = [];
        const newRects: RectificationRecord[] = [];

        realData.forEach((actualValue, idx) => {
            if (!actualValue || actualValue.length < 3) return;
            const predictedValue = predictions[idx].join('');
            const type = idx === 6 ? 'Centena' : 'Milhar';
            const rankLabel = idx === 0 ? "1º Prêmio (Elite)" : `${idx + 1}º Prêmio`;

            // Verificação de Acerto Exato
            if (actualValue === predictedValue) {
                newHits.push({
                    id: crypto.randomUUID(),
                    value: actualValue,
                    type,
                    status: 'Acerto',
                    position: idx + 1,
                    timestamp: Date.now()
                });
            } 
            // Verificação de Permutação (Quase Acerto)
            else if (actualValue.split('').sort().join('') === predictedValue.split('').sort().join('')) {
                newHits.push({
                    id: crypto.randomUUID(),
                    value: actualValue,
                    type,
                    status: 'Quase Acerto',
                    position: idx + 1,
                    timestamp: Date.now()
                });
            }

            // Gravação Automática em Ajustes (Aprendizado da IA)
            newRects.push({
                id: crypto.randomUUID(),
                type,
                generated: predictedValue,
                actual: actualValue,
                rankLabel,
                timestamp: Date.now()
            });
        });

        if (newHits.length > 0) {
            setHitsHistory(prev => {
                let updated = prev;
                newHits.forEach(h => { updated = maintainLimit(updated, h, true); });
                return updated;
            });
        }

        if (newRects.length > 0) {
            setRectificationHistory(prev => {
                let updated = prev;
                newRects.forEach(r => { updated = maintainLimit(updated, r, true); });
                return updated;
            });
        }

        if (newHits.length > 0) {
            setNotification(`SISTEMA AUTO-SYNC: ${newHits.length} PADRÕES REGISTRADOS`);
            setTimeout(() => setNotification(null), 3000);
        }
    }, []);

    const handleMarkHit = useCallback((value: string, type: 'Milhar' | 'Centena' | 'Dezena', pos: number, status: 'Acerto' | 'Quase Acerto' = 'Acerto') => {
        const newHit: HitRecord = { id: crypto.randomUUID(), value, type, status, position: pos, timestamp: Date.now() };
        setHitsHistory(prev => maintainLimit(prev, newHit, true));
        setNotification(`${status.toUpperCase()}: ${value}`);
        setTimeout(() => setNotification(null), 2000);
    }, []);

    const handleManualRectify = useCallback((gen: string, act: string, type: 'Milhar' | 'Centena' | 'Dezena', rankLabel: string) => {
        if (!act || act.length < 2) return;
        const newRec: RectificationRecord = { id: crypto.randomUUID(), type, generated: gen, actual: act, rankLabel, timestamp: Date.now() };
        setRectificationHistory(prev => maintainLimit(prev, newRec, true));
        setNotification(`AJUSTE MANUAL REGISTRADO`);
        setTimeout(() => setNotification(null), 2000);
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
        }, 1200);
    };

    const handleM3Change = (v: string[]) => {
        setM3(v);
        if (isLocked) setIsLocked(false);
    };

    const handlePasteM3 = (v: string[]) => {
        undoStack.current.push([...m3]);
        
        // Comparação instantânea e automática baseada na última predição
        processInstantSync(v, generatedResult);

        // Rotação de Dados
        setM1(m2); 
        setM2(m3); 
        setM3(v);

        // Gravação automática no histórico de entradas
        const numericSet = v.map(line => line.split('').map(Number));
        setInputHistory(prev => maintainLimit(prev, numericSet, false));
        
        setIsLocked(false);
        setNotification("DADOS ATUALIZADOS - IA RECALIBRADA");
        setTimeout(() => setNotification(null), 2000);
    };

    const handleClearM3 = () => {
        setM3(Array(7).fill(""));
        setIsLocked(false);
    };

    const handleUndoM3 = () => {
        if (undoStack.current.length > 0) {
            setM3(undoStack.current.pop()!);
            setIsLocked(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-slate-950 px-3 pt-2 pb-12 gap-3 text-slate-100 no-scrollbar overflow-y-auto">
            {notification && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 border border-amber-500/50 text-amber-500 px-6 py-3 font-orbitron font-black text-[9px] rounded-full shadow-2xl animate-bounce text-center uppercase tracking-widest backdrop-blur-md">
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
                    title="ATUAL (REAL)" 
                    values={m3} 
                    setValues={handleM3Change} 
                    onPaste={handlePasteM3} 
                    onClear={handleClearM3}
                    onUndo={handleUndoM3}
                />
            </div>

            <button 
                onClick={handleGenerate} 
                disabled={isLoading || isLocked}
                className={`w-full py-5 font-orbitron font-black rounded-[1.5rem] uppercase tracking-widest transition-all shadow-lg border-2 ${
                    isLoading || isLocked
                    ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
                    : 'bg-slate-900 border-amber-600 text-amber-500 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                }`}
            >
                {isLoading ? 'SINCRONIZANDO...' : isLocked ? 'BLOQUEADO: COLOQUE RESULTADO' : 'EXECUTAR ANÁLISE SÊNIOR'}
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
