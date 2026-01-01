
import React, { useState, useEffect } from 'react';

const LOGS = [
    "RECONHECENDO ESTRUTURAS...",
    "ISOLANDO SEQUÊNCIAS DE ELITE...",
    "ANALISANDO FREQUÊNCIAS HISTÓRICAS...",
    "EXECUTANDO RESSONÂNCIA NEURAL...",
    "CALIBRANDO MATRIZ DE 1º LUGAR...",
    "DETECTANDO ANOMALIAS DE PADRÃO...",
    "FILTRANDO COMBINAÇÕES ASSERTIVAS...",
    "FINALIZANDO PREVISÃO CABEÇA..."
];

const Loader: React.FC = () => {
    const [log, setLog] = useState(0);

    useEffect(() => {
        const i = setInterval(() => setLog(p => (p + 1) % LOGS.length), 350);
        return () => clearInterval(i);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center my-14 animate-in fade-in zoom-in duration-500">
            <div className="relative w-28 h-28">
                {/* Aneis de energia v12.1 */}
                <div className="absolute inset-0 border-[6px] border-cyan-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-[6px] border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-[2px] border-cyan-400/20 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                
                {/* Núcleo */}
                <div className="absolute inset-8 bg-cyan-500/10 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_20px_#06b6d4]"></div>
                </div>
            </div>
            <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-cyan-500 font-orbitron font-bold tracking-[0.4em] text-xs text-center min-w-[300px]">
                    {LOGS[log]}
                </p>
                <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
