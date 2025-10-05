// src/components/Results.tsx
import React from 'react';

type Score = { correct: number; total: number };

type ResultsProps = {
    provinceScore: Score;
    regionScore: Score;
    capitalScore: Score;
    regCount: number;
    onRestart: () => void;
};

export default function Results({provinceScore, regionScore, capitalScore, regCount, onRestart}: ResultsProps) {
    return (
        <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            padding: 24,
            borderRadius: 16,
            textAlign: 'center',
            maxWidth: 460,
            margin: '0 auto'
        }}>
            <h2 style={{marginBottom: 16}}>Resultaten</h2>
            <div style={{fontSize: 16, marginBottom: 12}}>
                Provinciescore: <b>{provinceScore.correct}/{provinceScore.total || 10}</b>
            </div>
            <div style={{fontSize: 16, marginBottom: 12}}>
                Gewestenscore: <b>{regionScore.correct}/{regionScore.total || regCount}</b>
            </div>
            <div style={{fontSize: 16, marginBottom: 12}}>
                Hoofdplaatsenscore: <b>{capitalScore.correct.toFixed(1)}/{capitalScore.total.toFixed(1)}</b>
            </div>
            <div style={{fontSize: 18, marginBottom: 24}}>
        <span style={{color: '#0f766e', fontWeight: 600}}>
          Totaalscore: {(provinceScore.correct + regionScore.correct + capitalScore.correct).toFixed(1)}/{((provinceScore.total || 10) + (regionScore.total || regCount) + capitalScore.total).toFixed(1)}
        </span>
            </div>
            <button
                onClick={onRestart}
                style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid #4f46e5',
                    background: '#6366f1',
                    color: '#fff',
                    cursor: 'pointer'
                }}
            >
                Opnieuw starten
            </button>
        </div>
    );
}
