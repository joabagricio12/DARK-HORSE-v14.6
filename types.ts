
export type DataSet = number[][];
export type History = DataSet[];

export interface Candidate {
    sequence: number[]; 
    confidence: number; 
}

export interface SpecificPrediction {
    value: string;
    confidence: number;
}

export interface AdvancedPredictions {
    hundreds: SpecificPrediction[];
    tens: SpecificPrediction[];
    eliteTens: SpecificPrediction[]; 
    superTens: SpecificPrediction[]; 
}

export interface HitRecord {
    id: string;
    type: 'Milhar' | 'Centena' | 'Dezena';
    status: 'Acerto' | 'Quase Acerto';
    value: string;
    position: number;
    timestamp: number;
}

export interface RectificationRecord {
    id: string;
    type: 'Milhar' | 'Centena' | 'Dezena';
    generated: string;
    actual: string;
    rankLabel: string; // Ex: "1º Prêmio", "7º Prêmio"
    timestamp: number;
}

export interface AppSettings {
    entropy: number; 
    voiceEnabled: boolean;
}

/**
 * Interface for individual set analysis results.
 * Used by both root and services analysis services.
 */
export interface AnalysisResult {
    rowSums: number[];
    rowEvenOdd: { evens: number; odds: number }[];
    rowDigitFreq: { [key: number]: number }[];
    colSums?: number[];
    colHighLow?: { highs: number; lows: number }[];
    colDigitFreq?: { [key: number]: number }[];
    globalDigitFreq: { [key: number]: number };
    firstPrizeFreq: { [key: number]: number };
    totalEvenOdd: { evens: number; odds: number };
    totalHighLow?: { highs: number; lows: number };
}

/**
 * Interface for historical analysis results.
 */
export interface HistoricalAnalysis {
    historicalDigitFreq: { [key: number]: number };
    historicalPositionalFreq?: { [pos: string]: { [digit: number]: number } };
    averageSetQuality?: number;
}

/**
 * Interface for hits analysis.
 */
export interface HitsAnalysis {
    winningDigitsFreq: { [key: number]: number };
    winningPositionalFreq: { [pos: string]: { [digit: number]: number } };
}

/**
 * Interface for rectification analysis.
 */
export interface RectificationAnalysis {
    correctionDigitFreq: { [key: number]: number };
    correctionPositionalFreq: { [pos: string]: { [digit: number]: number } };
}

/**
 * Combined analysis interface used by the UI components (StatisticsDisplay, etc.).
 */
export interface CombinedAnalysis {
    inputAnalysis: AnalysisResult;
    historicalAnalysis: HistoricalAnalysis;
    positionalHeatmap?: any;
    hitsAnalysis?: HitsAnalysis;
    rectificationAnalysis?: RectificationAnalysis;
}
