// src/components/MapQuiz.tsx
import React from 'react';
import {ComposableMap, Geographies, Geography} from "react-simple-maps";
import {ArrowRight} from "lucide-react";

type RegionKey = 'Vlaams Gewest' | 'Waals Gewest' | 'Brussels Hoofdstedelijk Gewest';
type ProvinceKey = string;

type MapQuizProps = {
    phase: 'provinces' | 'regions';
    geo: any;
    loading: boolean;
    error: string | null;

    // data
    NAMES: Record<ProvinceKey, { nl: string; id: string }>;
    REGIONS: Record<RegionKey, { members: string[] }>;
    REG_KEYS: RegionKey[];
    ALLOWED_IDS: Set<string>;

    // vraag & state
    question: { kind: 'provinces'; key: ProvinceKey } | { kind: 'regions'; key: RegionKey } | null;
    answerState: { id: string; ok: boolean } | null;
    results: Record<string, boolean | null>;
    highlights: string[];
    hoverMembers: string[];
    setHoverMembers: (ids: string[]) => void;

    // handlers
    onClickProvince: (f: any) => void;
    nextRound: () => void;

    // flags
    finished: boolean;
};

export default function MapQuiz(props: MapQuizProps) {
    const {
        phase, geo, loading, error,
        NAMES, REGIONS, REG_KEYS, ALLOWED_IDS,
        question, answerState, results, highlights, hoverMembers, setHoverMembers,
        onClickProvince, nextRound, finished
    } = props;

    return (
        <>
            {/* Kaart */}
            <div style={{width: '100%', height: '60vh', borderRadius: 12, overflow: 'hidden', background: '#f8fafc'}}>
                {loading && <div style={{padding: 12}}>Kaart laden…</div>}
                {error && <div style={{color: '#b91c1c', fontSize: 14}}>{error}</div>}
                {!loading && geo && (
                    <ComposableMap projection="geoMercator" projectionConfig={{scale: 5500, center: [4.6, 50.7]}}
                                   style={{width: '100%', height: '100%'}}>
                        <Geographies geography={geo}>
                            {({geographies}) => (
                                <>
                                    {geographies.map((g: any) => {
                                        const id = g.properties.id as string;
                                        let isClickable = false;
                                        if (phase === 'regions') {
                                            isClickable = Object.values(REGIONS).some(region => region.members.includes(id));
                                        } else {
                                            isClickable = ALLOWED_IDS.has(id);
                                        }
                                        const isHighlighted = highlights.includes(id);

                                        let fill = isClickable ? "#e2e8f0" : "#f1f5f9";
                                        if (isClickable && isHighlighted) {
                                            fill = answerState?.ok ? "#c7f9cc" : "#fee2e2";
                                        } else if (phase === 'regions' && hoverMembers.includes(id)) {
                                            fill = "#bfdbfe";
                                        }
                                        const stroke = "#64748b";
                                        const onEnter = () => {
                                            if (phase === 'regions') {
                                                let found: string[] | null = null;
                                                for (const region of Object.values(REGIONS)) {
                                                    if (region.members.includes(id)) {
                                                        found = region.members;
                                                        break;
                                                    }
                                                }
                                                if (found) setHoverMembers(found); else setHoverMembers([]);
                                            }
                                        };
                                        const onLeave = () => {
                                            if (phase === 'regions') setHoverMembers([]);
                                        };

                                        return (
                                            <Geography
                                                key={id}
                                                geography={g}
                                                onClick={() => isClickable && onClickProvince(g)}
                                                onMouseEnter={onEnter}
                                                onMouseLeave={onLeave}
                                                style={{
                                                    default: {
                                                        fill,
                                                        outline: "none",
                                                        stroke,
                                                        strokeWidth: 0.8,
                                                        cursor: isClickable ? 'pointer' : 'default'
                                                    },
                                                    hover: {fill, outline: "none"},
                                                    pressed: {fill: isClickable ? "#93c5fd" : fill, outline: "none"},
                                                }}
                                                className={isClickable && isHighlighted ? (answerState?.ok ? "ok" : "nok") : ""}
                                            />
                                        );
                                    })}
                                </>
                            )}
                        </Geographies>
                    </ComposableMap>
                )}
            </div>

            {/* Chips */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                padding: '8px 4px'
              }}
            >
              {(phase === 'provinces' ? (Object.keys(NAMES) as string[]) : (REG_KEYS as string[])).map((key) => {
                const val = results[key as string];
                const base = {
                  padding: '10px 14px',
                  borderRadius: 9999,
                  border: '1px solid #e2e8f0',
                  fontSize: 16,
                  lineHeight: '20px',
                  whiteSpace: 'nowrap'
                } as React.CSSProperties;
                let bg = '#fff', color = '#0f172a', border = '#e2e8f0';
                if (val === true) {
                  bg = '#dcfce7';
                  border = '#86efac';
                } else if (val === false) {
                  bg = '#fee2e2';
                  border = '#fecaca';
                }
                const label = phase === 'provinces' ? NAMES[key as keyof typeof NAMES].nl : (key as RegionKey);
                return (
                  <span key={key} style={{...base, background: bg, borderColor: border, color}}>
                    {label}
                  </span>
                );
              })}
            </div>

            {/* Volgende knop apart, zodat hij altijd zichtbaar is */}
            {finished && (
              <div style={{ padding: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={nextRound}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #4f46e5',
                    background: '#6366f1',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <ArrowRight size={16} /> Volgende
                </button>
              </div>
            )}
        </>
    );
}
