// src/components/Results.tsx
import React from 'react';

type Score = { correct: number; total: number };


type ResultsProps = {
    provinceScore: Score;
    regionScore: Score;
    capitalScore: Score;
    questionsScore?: Score;
    regCount: number;
    onRestart: () => void;
};

function getVerdict(score: number, total: number) {
    const perc = total > 0 ? (score / total) * 100 : 0;
    if (perc >= 90) return {label: '🌟 Uitstekend!', bg: '#dcfce7', border: '#86efac', color: '#065f46'};
    if (perc >= 80) return {label: '🎯 Zeer goed!', bg: '#dbeafe', border: '#93c5fd', color: '#1e3a8a'};
    if (perc >= 70) return {label: '👍 Goed', bg: '#fef9c3', border: '#fde68a', color: '#92400e'};
    if (perc >= 60) return {label: '🙂 Matig', bg: '#ffedd5', border: '#fdba74', color: '#7c2d12'};
    if (perc >= 50) return {label: '⚠️ Onvoldoende', bg: '#ffe4e6', border: '#fda4af', color: '#9f1239'};
    return {label: '❌ Niet geslaagd', bg: '#fee2e2', border: '#fecaca', color: '#7f1d1d'};
}

export default function Results({provinceScore, regionScore, capitalScore, questionsScore, regCount, onRestart}: ResultsProps) {
    const q = questionsScore ?? { correct: 0, total: 0 };
    const totalCorrect = provinceScore.correct + regionScore.correct + capitalScore.correct + q.correct;
    const totalMax = (provinceScore.total || 10) + (regionScore.total || regCount) + capitalScore.total + q.total;
    const verdict = getVerdict(totalCorrect, totalMax);
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
            <div style={{fontSize: 16, marginBottom: 12}}>
                Vragenscore: <b>{q.correct.toFixed(1)}/{q.total.toFixed(1)}</b>
            </div>
            <div style={{fontSize: 18, marginBottom: 24}}>
        <span style={{color: '#0f766e', fontWeight: 600}}>
          Totaalscore: {totalCorrect.toFixed(1)}/{totalMax.toFixed(1)}
        </span>
            </div>
            <div style={{marginBottom: 20}}>
              <span
                  style={{
                      display: 'inline-block',
                      padding: '6px 10px',
                      borderRadius: 9999,
                      background: verdict.bg,
                      border: `1px solid ${verdict.border}`,
                      color: verdict.color,
                      fontWeight: 600,
                      fontSize: 14,
                  }}
              >
                {verdict.label}
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
