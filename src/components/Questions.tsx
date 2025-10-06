import React, {useEffect, useMemo, useState} from 'react';
import {ComposableMap, Geographies, Geography} from "react-simple-maps";
import {CheckCircle2, XCircle} from 'lucide-react';

// normaliseer: case-insensitive, spaties/koppelteken weg, accenten strippen
function norm(v: string) {
    const s = (v || "").toLowerCase().trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // accenten
        .replace(/['`´^¨~]/g, '')
        .replace(/[\s_-]/g, '');
    return s;
}

const EXPECT = {
    p1: 'limburg',
    p2: 'hasselt',
    p3: 'sinttruiden', // "sint-truiden" → spaties/tekens genegeerd
    neighbors: [
        'alken', 'wellen', 'borgloon', 'heers', 'gingelom', 'landen', 'zoutleeuw', 'nieuwerkerken'
    ].map(norm),
    d2a: 'vlaanderen',
    d2b: 'wallonie',       // "Wallonië" -> zonder accent
    d2c: 'vlaamsbrabant', // "Vlaams-Brabant"
    d3a: 'oostvlaanderen',
    d3b: 'antwerpen',
    d3c: 'vlaamsbrabant',
    d3d: 'waalsbrabant',
    d3e: 'brussel',
};

export type QuestionsProps = {
    geo: any;
    loading: boolean;
    error: string | null;
    onFinish: () => void; // naar resultaten
    setQuestionsScore: (score: { correct: number; total: number }) => void;
    setScore?: (score: { correct: number; total: number }) => void; // voor header-badge (optioneel)
};

export default function Questions({geo, loading, error, onFinish, setQuestionsScore, setScore}: QuestionsProps) {
    const [values, setValues] = useState({
        p1: '',
        p2: '',
        p3: '',
        n4: '',
        n5: '',
        n6: '',
        n7: '',
        n8: '',
        n9: '',
        n10: '',
        n11: '',
        d2a: '',
        d2b: '',
        d2c: '',
        d3a: '',
        d3b: '',
        d3c: '',
        d3d: '',
        d3e: '',
    });
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // toon direct juiste denominator voor deze sectie (indien doorgegeven)
        if (typeof setScore === 'function') {
            setScore({ correct: 0, total: 15 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const neighborUser = useMemo(
        () => [values.n4, values.n5, values.n6, values.n7, values.n8, values.n9, values.n10, values.n11].map(norm),
        [values]
    );

    const evalResult = useMemo(() => {
        if (!checked) return null;
        const p1ok = norm(values.p1) === EXPECT.p1;
        const p2ok = norm(values.p2) === EXPECT.p2;
        const p3ok = norm(values.p3) === EXPECT.p3;
        // set-vergelijking (volgorde-onafhankelijk)
        const exp = new Set(EXPECT.neighbors);
        const seen = new Set<string>();
        let correctCount = 0;
        neighborUser.forEach(v => {
            if (!v) return;
            if (exp.has(v) && !seen.has(v)) {
                correctCount++;
                seen.add(v);
            }
        });
        const d2aOk = norm(values.d2a) === EXPECT.d2a;
        const d2bOk = norm(values.d2b) === EXPECT.d2b;
        const d2cOk = norm(values.d2c) === EXPECT.d2c;
        const d3aOk = norm(values.d3a) === EXPECT.d3a;
        const d3bOk = norm(values.d3b) === EXPECT.d3b;
        const d3cOk = norm(values.d3c) === EXPECT.d3c;
        const d3dOk = norm(values.d3d) === EXPECT.d3d;
        const d3eOk = norm(values.d3e) === EXPECT.d3e;
        return {p1ok, p2ok, p3ok, d2aOk, d2bOk, d2cOk, d3aOk, d3bOk, d3cOk, d3dOk, d3eOk, correctCount};
    }, [checked, values, neighborUser]);

    const onChange = (k: keyof typeof values) =>
        (e: React.ChangeEvent<HTMLInputElement>) => setValues(v => ({...v, [k]: e.target.value}));

    function computeScore(v = values) {
        const p1ok = norm(v.p1) === EXPECT.p1;
        const p2ok = norm(v.p2) === EXPECT.p2;
        const p3ok = norm(v.p3) === EXPECT.p3;
        const exp = new Set(EXPECT.neighbors);
        const seen = new Set<string>();
        let correctNeighbors = 0;
        [v.n4, v.n5, v.n6, v.n7, v.n8, v.n9, v.n10, v.n11].map(norm).forEach(x => {
            if (!x) return;
            if (exp.has(x) && !seen.has(x)) {
                correctNeighbors++;
                seen.add(x);
            }
        });
        const d2aOk = norm(v.d2a) === EXPECT.d2a;
        const d2bOk = norm(v.d2b) === EXPECT.d2b;
        const d2cOk = norm(v.d2c) === EXPECT.d2c;
        const d3aOk = norm(v.d3a) === EXPECT.d3a;
        const d3bOk = norm(v.d3b) === EXPECT.d3b;
        const d3cOk = norm(v.d3c) === EXPECT.d3c;
        const d3dOk = norm(v.d3d) === EXPECT.d3d;
        const d3eOk = norm(v.d3e) === EXPECT.d3e;
        const correct =
            (p1ok ? 1 : 0) + (p2ok ? 1 : 0) + (p3ok ? 1 : 0) +
            correctNeighbors * 0.5 +
            (d2aOk ? 1 : 0) + (d2bOk ? 1 : 0) + (d2cOk ? 1 : 0) +
            (d3aOk ? 1 : 0) + (d3bOk ? 1 : 0) + (d3cOk ? 1 : 0) + (d3dOk ? 1 : 0) + (d3eOk ? 1 : 0);
        return { correct, total: 15 };
    }

    // Compute validity for each neighbor input individually
    const neighborValid = useMemo(() => {
        if (!checked) return Array(8).fill(undefined);
        const exp = new Set(EXPECT.neighbors);
        const seen = new Set<string>();
        return neighborUser.map(v => {
            if (!v) return undefined;
            if (exp.has(v) && !seen.has(v)) {
                seen.add(v);
                return true;
            }
            return false;
        });
    }, [checked, neighborUser]);

    return (
        <div style={{display: 'grid', gap: 16}}>
            {/* “Afbeelding” van België: niet-interactieve kaart als visueel hulpmiddel */}
            <div style={{width: '100%', height: '40vh', borderRadius: 12, overflow: 'hidden', background: '#f8fafc'}}>
                {loading && <div style={{padding: 12}}>Kaart laden…</div>}
                {error && <div style={{color: '#b91c1c', fontSize: 14}}>{error}</div>}
                {!loading && geo && (
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{scale: 5500, center: [4.6, 50.7]}}
                        style={{width: '100%', height: '100%', filter: 'grayscale(1) contrast(1.1)'}}
                    >
                        <Geographies geography={geo}>
                            {({geographies}) => (
                                <>
                                    {geographies.map((g: any) => (
                                        <Geography
                                            key={g.properties.id}
                                            geography={g}
                                            style={{
                                                default: {
                                                    fill: '#e5e7eb',
                                                    outline: 'none',
                                                    stroke: '#94a3b8',
                                                    strokeWidth: 0.6,
                                                    pointerEvents: 'none'
                                                },
                                                hover: {fill: '#e5e7eb', outline: 'none'},
                                                pressed: {fill: '#e5e7eb', outline: 'none'},
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                        </Geographies>
                    </ComposableMap>
                )}

            </div>

            {/* Vragen */}
            <div style={{background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16}}>
                <h3 style={{marginTop: 0}}>DEEL 1 - Onze school</h3>
                <div style={{marginTop: 0, color: '#334155', lineHeight: 1.9}}>
                    Onze school ligt in de provincie
                    <InlineInput value={values.p1} onChange={onChange('p1')} valid={checked ? evalResult?.p1ok : undefined} width={180} />.
                    De hoofdplaats van deze provincie is
                    <InlineInput value={values.p2} onChange={onChange('p2')} valid={checked ? evalResult?.p2ok : undefined} width={180} />.
                    Onze school ligt in de gemeente
                    <InlineInput value={values.p3} onChange={onChange('p3')} valid={checked ? evalResult?.p3ok : undefined} width={220} />.
                    En de 8 buurgemeenten zijn
                    <InlineInput value={values.n4} onChange={onChange('n4')} valid={checked ? neighborValid[0] : undefined} width={160} />,
                    <InlineInput value={values.n5} onChange={onChange('n5')} valid={checked ? neighborValid[1] : undefined} width={160} />,
                    <InlineInput value={values.n6} onChange={onChange('n6')} valid={checked ? neighborValid[2] : undefined} width={160} />,
                    <InlineInput value={values.n7} onChange={onChange('n7')} valid={checked ? neighborValid[3] : undefined} width={160} />,
                    <InlineInput value={values.n8} onChange={onChange('n8')} valid={checked ? neighborValid[4] : undefined} width={160} />,
                    <InlineInput value={values.n9} onChange={onChange('n9')} valid={checked ? neighborValid[5] : undefined} width={160} />,
                    <InlineInput value={values.n10} onChange={onChange('n10')} valid={checked ? neighborValid[6] : undefined} width={160} /> en
                    <InlineInput value={values.n11} onChange={onChange('n11')} valid={checked ? neighborValid[7] : undefined} width={160} />.
                </div>
                {checked && (
                    <div style={{marginTop: 8, fontSize: 14, color: '#0f172a'}}>
                        Buurgemeenten correct: <b>{evalResult?.correctCount}/8</b>
                    </div>
                )}

                {/* DEEL 2 */}
                <div style={{marginTop: 18, paddingTop: 10, borderTop: '1px dashed #e2e8f0'}}>
                  <h3 style={{marginTop: 0}}>DEEL 2 - Gewesten</h3>
                  <div style={{marginTop: 0, color: '#334155', lineHeight: 1.9}}>
                    Het Vlaams gewest noemen we ook
                    <InlineInput value={values.d2a} onChange={onChange('d2a')} valid={checked ? evalResult?.d2aOk : undefined} width={200} />.
                    Het Waals gewest noemen we ook
                    <InlineInput value={values.d2b} onChange={onChange('d2b')} valid={checked ? evalResult?.d2bOk : undefined} width={200} />.
                    Welke provincie grenst aan het Brussels Hoofdstedelijk gewest?
                    <InlineInput value={values.d2c} onChange={onChange('d2c')} valid={checked ? evalResult?.d2cOk : undefined} width={220} />.
                  </div>
                </div>

                {/* DEEL 3 */}
                <div style={{marginTop: 18, paddingTop: 10, borderTop: '1px dashed #e2e8f0'}}>
                  <h3 style={{marginTop: 0}}>DEEL 3 - Provincie of hoofdplaats</h3>
                  <div style={{marginTop: 0, color: '#334155', lineHeight: 1.9}}>
                    <InlineInput value={values.d3a} onChange={onChange('d3a')} valid={checked ? evalResult?.d3aOk : undefined} width={220} /> grenst aan Antwerpen, Vlaams-Brabant, West-Vlaanderen en Henegouwen.
                    <br/>
                    <InlineInput value={values.d3b} onChange={onChange('d3b')} valid={checked ? evalResult?.d3bOk : undefined} width={220} /> grenst aan Oost-Vlaanderen, Vlaams-Brabant en Limburg.
                    <br/>
                    <InlineInput value={values.d3c} onChange={onChange('d3c')} valid={checked ? evalResult?.d3cOk : undefined} width={220} /> ligt midden in ons land en is Vlaams.
                    <br/>
                    <InlineInput value={values.d3d} onChange={onChange('d3d')} valid={checked ? evalResult?.d3dOk : undefined} width={220} /> ligt midden in ons land en is Waals.
                    <br/>
                    De stad <InlineInput value={values.d3e} onChange={onChange('d3e')} valid={checked ? evalResult?.d3eOk : undefined} width={180} /> ligt midden in ons land en is tweetalig. Het is de Belgische hoofdstad.
                  </div>
                </div>

                {/* Acties */}
                <div style={{display: 'flex', gap: 8, marginTop: 14}}>
                    {!checked ? (
                        <button
                            onClick={() => {
                                setChecked(true);
                                const s = computeScore();
                                setQuestionsScore(s);
                                if (typeof setScore === 'function') setScore(s);
                            }}
                            style={btnPrimary}
                        >
                            Nakijken
                        </button>
                    ) : (
                        <button onClick={onFinish} style={btnPrimary}>Naar resultaten</button>
                    )}
                </div>
            </div>
        </div>
    );
}

function InlineInput({ value, onChange, valid, width = 160 }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; valid?: boolean; width?: number }) {
    const show = typeof valid === 'boolean';
    const border = !show ? '#cbd5e1' : valid ? '#22c55e' : '#ef4444';
    return (
        <input
            value={value}
            onChange={onChange}
            placeholder="antwoord"
            style={{
                display: 'inline-block',
                width,
                minWidth: 120,
                padding: '6px 8px',
                borderRadius: 8,
                border: `1px solid ${border}`,
                margin: '4px 6px',
                verticalAlign: 'baseline',
            }}
        />
    );
}

function LabeledInput({label, value, onChange, valid}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    valid?: boolean
}) {
    const show = typeof valid === 'boolean';
    const border = !show ? '#cbd5e1' : valid ? '#22c55e' : '#ef4444';
    const icon = show ? (valid ? <CheckCircle2 size={16} color="#16a34a"/> :
        <XCircle size={16} color="#dc2626"/>) : null;
    return (
        <label style={{display: 'grid', gap: 6, fontSize: 14}}>
            <span style={{color: '#475569'}}>{label}</span>
            <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
        <input
            value={value}
            onChange={onChange}
            placeholder="antwoord"
            style={{flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${border}`}}
        />
                {icon}
      </span>
        </label>
    );
}

const btnPrimary: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #4f46e5',
    background: '#6366f1',
    color: '#fff',
    cursor: 'pointer'
};
const btnGhost: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer'
};