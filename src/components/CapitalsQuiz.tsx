// src/components/CapitalsQuiz.tsx
import React from 'react';
import {ArrowRight} from 'lucide-react';

type ProvinceKey = string;

export type CapitalRow = {
    province: ProvinceKey | null;
    capital: string | null;
    evaluated?: boolean;
    correct?: boolean;            // full-row ok (compat)
    correctProvince?: boolean;    // 0,5 pt: provincie in juiste helft
    correctCapital?: boolean;     // 0,5 pt: hoofdstad matcht provincie (of Brussel in rij 11)
};

type CapitalsQuizProps = {
    NAMES: Record<ProvinceKey, { nl: string; id: string }>;
    CAPITALS: Record<ProvinceKey, string>;
    FLEMISH_KEYS: ProvinceKey[];
    WALLOON_KEYS: ProvinceKey[];
    BRUSSELS_CAPITAL: string;

    capProvincesPool: ProvinceKey[];
    setCapProvincesPool: React.Dispatch<React.SetStateAction<ProvinceKey[]>>;
    capCapitalsPool: string[];
    setCapCapitalsPool: React.Dispatch<React.SetStateAction<string[]>>;
    capRows: CapitalRow[];
    setCapRows: React.Dispatch<React.SetStateAction<CapitalRow[]>>;
    dragItem: { kind: 'province' | 'capital'; value: string } | null;
    setDragItem: React.Dispatch<React.SetStateAction<{ kind: 'province' | 'capital'; value: string } | null>>;

    capitalScore: { correct: number; total: number };
    setCapitalScore: React.Dispatch<React.SetStateAction<{ correct: number; total: number }>>;
    setScore: React.Dispatch<React.SetStateAction<{ correct: number; total: number }>>;
    finished: boolean;
    setFinished: React.Dispatch<React.SetStateAction<boolean>>;
    setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CapitalsQuiz(props: CapitalsQuizProps) {
    const {
        NAMES, CAPITALS, FLEMISH_KEYS, WALLOON_KEYS, BRUSSELS_CAPITAL,
        capProvincesPool, setCapProvincesPool,
        capCapitalsPool, setCapCapitalsPool,
        capRows, setCapRows,
        dragItem, setDragItem,
        capitalScore, setCapitalScore,
        setScore, finished, setFinished, setShowResults,
    } = props;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 12, alignItems: 'start' }}>
            {/* Linkerkolom: provincies */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: 16, minHeight: 200 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Provincies</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {capProvincesPool.map(p => (
                        <div
                            key={p}
                            draggable
                            onDragStart={(e) => { setDragItem({ kind: 'province', value: p }); e.dataTransfer.setData('text/plain', `province:${p}`); }}
                            style={{ padding: '6px 10px', borderRadius: 9999, border: '1px solid #94a3b8', cursor: 'grab', background: '#fff' }}
                        >
                            {NAMES[p].nl}
                        </div>
                    ))}
                </div>
            </div>

            {/* Middenkolom: Tabel */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Koppel per rij: Provincie &amp; Hoofdplaats</div>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: 8, width: '50%' }}>Provincie</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: 8, width: '50%' }}>Hoofdplaats</th>
                        </tr>
                        </thead>
                        <tbody>
                        {capRows.map((row, i) => {
                            // Helper: eind-evaluatie — 0,5pt provincie-helft + 0,5pt hoofdstad; Brussel-rij alleen 0,5 voor hoofdstad
                            const checkAllFilledThenEvaluate = (changedIndex: number, changedRow: CapitalRow) => {
                                const snapshot = (capRows as CapitalRow[]).map((r, idx) => idx === changedIndex ? changedRow : r);
                                const allFilled = snapshot.every((r, idx) => idx < 10 ? (r.province && r.capital) : (!!r.capital));
                                if (!allFilled) return;

                                let points = 0; // max 10.5
                                const evaluated = snapshot.map((r, rowIndex) => {
                                    if (rowIndex === 10) {
                                        const okCap = r.capital === BRUSSELS_CAPITAL;
                                        if (okCap) points += 0.5;
                                        return { ...r, evaluated: true, correct: okCap, correctProvince: undefined, correctCapital: okCap };
                                    }
                                    const prov = r.province;
                                    const cap  = r.capital;
                                    const okCap = !!prov && !!cap && CAPITALS[prov] === cap;
                                    const isFlemishRow = rowIndex < 5; // 0..4 Vlaams, 5..9 Waals
                                    const okProv = !!prov && (isFlemishRow ? FLEMISH_KEYS.includes(prov) : WALLOON_KEYS.includes(prov));
                                    if (okProv) points += 0.5;
                                    if (okCap)  points += 0.5;
                                    return { ...r, evaluated: true, correct: okProv && okCap, correctProvince: okProv, correctCapital: okCap };
                                });

                                setCapRows(evaluated);
                                setCapitalScore({ correct: points, total: 10.5 });
                                setScore({ correct: points, total: 10.5 });
                                setFinished(true);
                            };

                            const onDropProvince = (e: React.DragEvent) => {
                                e.preventDefault();
                                if (i === 10 || row.province) return;
                                const data = dragItem || (() => {
                                    const t = e.dataTransfer.getData('text/plain');
                                    if (t.startsWith('province:')) return { kind: 'province' as const, value: t.split(':')[1] };
                                    return null;
                                })();
                                if (!data || data.kind !== 'province') return;
                                const droppedProv = data.value as ProvinceKey;
                                setCapProvincesPool(pool => pool.filter(v => v !== droppedProv));
                                const newRow = { ...row, province: droppedProv };
                                setCapRows(prev => { const copy = [...prev]; copy[i] = newRow; return copy; });
                                setDragItem(null);
                                checkAllFilledThenEvaluate(i, newRow);
                            };

                            const onDropCapital = (e: React.DragEvent) => {
                                e.preventDefault();
                                if (row.capital) return;
                                const data = dragItem || (() => {
                                    const t = e.dataTransfer.getData('text/plain');
                                    if (t.startsWith('capital:')) return { kind: 'capital' as const, value: t.split(':')[1] };
                                    return null;
                                })();
                                if (!data || data.kind !== 'capital') return;
                                const droppedCap = data.value;
                                setCapCapitalsPool(pool => pool.filter(v => v !== droppedCap));
                                const newRow = { ...row, capital: droppedCap };
                                setCapRows(prev => { const copy = [...prev]; copy[i] = newRow; return copy; });
                                setDragItem(null);
                                checkAllFilledThenEvaluate(i, newRow);
                            };

                            const sectionHeader = (i === 0 || i === 5 || i === 10) ? (
                                <tr key={`sect-${i}`} style={{ background: '#eef2ff' }}>
                                    <td colSpan={2} style={{ padding: 8, borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#374151' }}>
                                        {i === 0 ? 'Vlaams Gewest (rijen 1–5)' : i === 5 ? 'Waals Gewest (rijen 6–10)' : 'Brussels Hoofdstedelijk Gewest (rij 11)'}
                                    </td>
                                </tr>
                            ) : null;

                            const provinceBg = row.evaluated
                                ? (row.correctProvince === undefined ? '#f8fafc' : (row.correctProvince ? '#dcfce7' : '#fee2e2'))
                                : '#fff';
                            const capitalBg = row.evaluated
                                ? (row.correctCapital ? '#dcfce7' : '#fee2e2')
                                : '#fff';

                            return (
                                <React.Fragment key={`row-wrap-${i}`}>
                                    {sectionHeader}
                                    <tr>
                                        <td
                                            onDragOver={(e) => { if (i !== 10 && !row.province) e.preventDefault(); }}
                                            onDrop={onDropProvince}
                                            style={{ borderBottom: '1px solid #e2e8f0', padding: 8, borderRight: '1px solid #e2e8f0', background: provinceBg, color: i === 10 ? '#94a3b8' : undefined }}
                                        >
                                            {i === 10 ? <span>— (geen provincie)</span> : (row.province ? <b>{NAMES[row.province].nl}</b> : <span style={{ color: '#94a3b8' }}>sleep provincie hier</span>)}
                                        </td>
                                        <td
                                            onDragOver={(e) => { if (!row.capital) e.preventDefault(); }}
                                            onDrop={onDropCapital}
                                            style={{ borderBottom: '1px solid #e2e8f0', padding: 8, background: capitalBg }}
                                        >
                                            {row.capital ? <b>{row.capital}</b> : <span style={{ color: '#94a3b8' }}>sleep hoofdplaats hier</span>}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {finished && (
                    <div style={{ marginTop: 12 }}>
                        <button
                            onClick={() => setShowResults(true)}
                            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #4f46e5', background: '#6366f1', color: '#fff', cursor: 'pointer' }}
                        >
                            <ArrowRight size={16} style={{ marginRight: 6 }} /> Volgende
                        </button>
                    </div>
                )}
            </div>

            {/* Rechterkolom: hoofdplaatsen */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: 16, minHeight: 200 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Hoofdplaatsen</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {capCapitalsPool.map(c => (
                        <div
                            key={c}
                            draggable
                            onDragStart={(e) => { setDragItem({ kind: 'capital', value: c }); e.dataTransfer.setData('text/plain', `capital:${c}`); }}
                            style={{ padding: '6px 10px', borderRadius: 9999, border: '1px solid #94a3b8', cursor: 'grab', background: '#fff' }}
                        >
                            {c}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
