// src/components/Header.tsx
import React from 'react';
import {Flag, Map as MapIcon, Volume2, VolumeX} from 'lucide-react';

type RegionKey = 'Vlaams Gewest' | 'Waals Gewest' | 'Brussels Hoofdstedelijk Gewest';
type ProvinceKey = string;
type Question = { kind: 'provinces'; key: ProvinceKey } | { kind: 'regions'; key: RegionKey } | null;

type HeaderProps = {
    phase: 'provinces' | 'regions' | 'capitals';
    showResults: boolean;
    question: Question;
    NAMES: Record<ProvinceKey, { nl: string; id: string }>;
    session: { rounds: number; correct: number; total: number };
    sound: boolean;
    setSound: React.Dispatch<React.SetStateAction<boolean>>;
    score: { correct: number; total: number };
    capitalScore: { correct: number; total: number };
    orderLen: number;
    regLen: number;
};

export default function Header({
                                   phase,
                                   showResults,
                                   question,
                                   NAMES,
                                   session,
                                   sound,
                                   setSound,
                                   score,
                                   capitalScore,
                                   orderLen,
                                   regLen,
                               }: HeaderProps) {
    const subtitle =
        phase === 'provinces' ? 'Provincies' :
            phase === 'regions' ? 'Gewesten' :
                'Hoofdplaatsen';

    const scoreNum = phase === 'capitals' ? capitalScore.correct.toFixed(1) : String(score.correct);
    const scoreDen =
        phase === 'provinces' ? String(orderLen || 10)
            : phase === 'regions' ? String(regLen)
                : capitalScore.total.toFixed(1);

    return (
        <>
            {/* Titel */}
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                <MapIcon size={22}/>
                <h1 style={{fontSize: 20, margin: 0}}>Toets WO</h1>
            </div>

            {/* Subtitel */}
            {!showResults && (
                <div style={{marginBottom: 12}}>
                    <span style={{fontSize: 16, fontWeight: 500, color: '#6366f1'}}>{subtitle}</span>
                </div>
            )}

            {/* Opdracht + score + geluid */}
            {!showResults && (
                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                    <Flag size={18}/>
                    <div style={{fontWeight: 600}}>
                        {phase === 'capitals'
                            ? 'Sleep de provincies en hoofdplaatsen naar de juiste vakjes'
                            : <>Klik
                                op: {question ? (question.kind === 'provinces' ? NAMES[question.key as ProvinceKey].nl : (question.key as RegionKey)) : '...'}</>}
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 8, zIndex: 5 }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <div style={{fontSize: 12, background: '#eef2ff', padding: '4px 8px', borderRadius: 8}}>
                                Score: {scoreNum}/{scoreDen}
                            </div>
                            {session.rounds > 0 && (
                                <div style={{fontSize: 12, background: '#e0f2fe', padding: '4px 8px', borderRadius: 8}}>
                                    Totaal: {session.correct}/{session.total} ({session.rounds}x)
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSound(s => !s)}
                            style={{
                                padding: 6,
                                borderRadius: 8,
                                border: '1px solid #4f46e5',
                                background: '#6366f1',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            aria-label="Geluid aan/uit"
                        >
                            {sound ? <Volume2 size={16}/> : <VolumeX size={16}/>}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
