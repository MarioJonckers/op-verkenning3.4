import React, { useEffect, useState } from "react";
import { Map as MapIcon, RefreshCw, Volume2, VolumeX, Flag, ArrowRight } from "lucide-react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

/**
 * 🇧🇪 Belgische Provincie Quiz – Vlaamse versie (10 provincies, NL feedback)
 *
 * Robuust: gebruikt NUTS2 **IDs** i.p.v. namen om clicks te herkennen.
 * - Alleen de 10 provincies zijn klikbaar (Brussel wordt genegeerd)
 * - Feedback/spraak enkel NL
 */

// ---- STYLES ----
const baseCss = `
  .ok { filter: drop-shadow(0 0 0.35rem rgba(34,197,94,0.7)); }
  .nok { filter: drop-shadow(0 0 0.35rem rgba(239,68,68,0.7)); }
`;
const globalReset = `
  html, body, #root { height: 100%; margin: 0; padding: 0; overflow-x: hidden; }
  *, *::before, *::after { box-sizing: border-box; }
`;

const styles: Record<string, React.CSSProperties> = {
    page: {
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #f8fafc, #eef2f7)',
      color: '#0f172a',
      padding: 0,
      margin: 0,
      overflow: 'hidden',
    },
    container: { width: '100%', height: '100%', margin: 0, display: 'grid', gridTemplateColumns: '1fr', gap: 0, overflow: 'hidden' },
    left: { width: '100%', height: '100%', overflow: 'hidden' },
    right: { display: 'grid', gap: 16 },
    card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 0, padding: 16, boxShadow: '0 1px 2px rgba(16,24,40,0.04)', width: '100%', maxWidth: '100%' },
    controlsRow: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
    label: { display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 },
    btnPrimary: { padding: '6px 10px', marginRight: 6, borderRadius: 8, border: '1px solid #4f46e5', background: '#6366f1', color: '#fff', cursor: 'pointer' },
    btnGhost: { padding: '6px 10px', marginRight: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' },
    btnSecondary: { padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f1f5f9', cursor: 'pointer' },
    btnOutline: { padding: '6px 10px', borderRadius: 8, border: '1px solid #94a3b8', background: '#fff', cursor: 'pointer' },
    iconBtn: {
      padding: 6,
      borderRadius: 8,
      border: '1px solid #4f46e5',
      background: '#6366f1',
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    mapWrap: { width: '100%', height: '70vh', borderRadius: 12, overflow: 'hidden', background: '#f8fafc' },
    input: { flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 },
    tile: { textAlign: 'left', padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' },
};

// ---- DATA ----
const NUTS2_GEOJSON_URL =
    "https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v2/2021/4326/20M/nutsrg_2.json";

// Provincies met vaste NUTS2 IDs (Brussel = BE10 → niet opnemen)
const NAMES = {
    Antwerpen:        { nl: "Antwerpen",        en: "Antwerp",          id: "BE21" },
    Limburg:          { nl: "Limburg",          en: "Limburg",          id: "BE22" },
    "Oost-Vlaanderen": { nl: "Oost-Vlaanderen", en: "East Flanders",     id: "BE23" },
    "Vlaams-Brabant":  { nl: "Vlaams-Brabant",  en: "Flemish Brabant",   id: "BE24" },
    "West-Vlaanderen": { nl: "West-Vlaanderen", en: "West Flanders",      id: "BE25" },
    "Waals-Brabant":   { nl: "Waals-Brabant",   en: "Walloon Brabant",   id: "BE31" },
    Henegouwen:       { nl: "Henegouwen",       en: "Hainaut",           id: "BE32" },
    Luik:             { nl: "Luik",             en: "Liège",            id: "BE33" },
    Luxemburg:        { nl: "Luxemburg",        en: "Luxembourg",        id: "BE34" },
    Namen:            { nl: "Namen",            en: "Namur",            id: "BE35" },
} as const;

type RegionKey = 'Vlaams Gewest' | 'Waals Gewest' | 'Brussels Hoofdstedelijk Gewest';
const REGIONS: Record<RegionKey, { members: string[] }> = {
  'Vlaams Gewest': { members: ['BE21','BE22','BE23','BE24','BE25'] }, // Vlaanderen
  'Waals Gewest': { members: ['BE31','BE32','BE33','BE34','BE35'] },  // Wallonië
  'Brussels Hoofdstedelijk Gewest': { members: ['BE10'] },            // Brussel
};
const REG_KEYS = Object.keys(REGIONS) as RegionKey[];

type ProvinceKey = keyof typeof NAMES;
type Question = { kind: 'provinces'; key: ProvinceKey } | { kind: 'regions'; key: RegionKey };
const ALL_KEYS = Object.keys(NAMES) as (keyof typeof NAMES)[];
const ALLOWED_IDS = new Set(Object.values(NAMES).map(v => v.id));
const ID_TO_KEY = new Map<string, keyof typeof NAMES>(Object.entries(NAMES).map(([k, v]) => [v.id, k as keyof typeof NAMES]));

function useSpeech(enabled: boolean) {
    const speak = (text: string) => {
        if (!enabled) return;
        try { const u = new SpeechSynthesisUtterance(text); u.lang = "nl-BE"; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch {}
    };
    return speak;
}

// Klein hulpfunctie om volgorde te schudden
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ---- APP ----
export default function App() {
    const [sound, setSound] = useState(true);
    const [question, setQuestion] = useState<Question | null>(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [answerState, setAnswerState] = useState<{ id: string; ok: boolean } | null>(null);
    const [highlights, setHighlights] = useState<string[]>([]);
    // Hover-highlight voor regiovragen (toon hele gewest op hover)
    const [hoverMembers, setHoverMembers] = useState<string[]>([]);

    // Totaalscore over meerdere ronden
    const [session, setSession] = useState({ rounds: 0, correct: 0, total: 0 });

    // Eén keer alle provincies: volgorde + index + resultaten
    const [order, setOrder] = useState<string[]>([]);
    const [idx, setIdx] = useState(0);
    const [results, setResults] = useState<Record<string, boolean | null>>({});
    const [finished, setFinished] = useState(false);
    const [phase, setPhase] = useState<'provinces'|'regions'>('provinces');

    // Nieuw: eindresultaten tonen
    const [showResults, setShowResults] = useState(false);
    // Scores opslaan voor eindresultaten
    const [provinceScore, setProvinceScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
    const [regionScore, setRegionScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

    const [geo, setGeo] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const speak = useSpeech(sound);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true); setError(null);
                const res = await fetch(NUTS2_GEOJSON_URL, { cache: 'no-store' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const gj = await res.json();
                const features = gj.features.filter((f: any) => (f.properties?.id ?? "").startsWith("BE"));
                setGeo({ ...gj, features });
            } catch (e: any) { setError(`Kon kaartdata niet laden: ${e?.message ?? e}`); }
            finally { setLoading(false); }
        })();
    }, []);

    // (Her)start de test: alle 10 provincies exact 1x
    const startTest = () => {
      const o = shuffle(ALL_KEYS as string[]);
      setPhase('provinces');
      setOrder(o);
      setIdx(0);
      setResults(Object.fromEntries(ALL_KEYS.map(k => [k, null])));
      setScore({ correct: 0, total: 0 });
      setAnswerState(null);
      setHighlights([]);
      setHoverMembers([]);
      setFinished(false);
      setShowResults(false);
      setQuestion({ kind: 'provinces', key: o[0] as ProvinceKey });
      speak(`Waar ligt ${NAMES[o[0] as ProvinceKey].nl}?`);
    };

    const startRegions = () => {
      const o = shuffle(REG_KEYS as string[]);
      setPhase('regions');
      setOrder(o);
      setIdx(0);
      setResults(Object.fromEntries(REG_KEYS.map(k => [k, null])));
      setScore({ correct: 0, total: 0 });
      setAnswerState(null);
      setHighlights([]);
      setHoverMembers([]);
      setFinished(false);
      setQuestion({ kind: 'regions', key: o[0] as RegionKey });
      speak(`Waar ligt ${o[0] as RegionKey}?`);
    };

    // Sla eerst de voorbije ronde op in de totaalscore en start dan een nieuwe
    const nextRound = () => {
      // Bewaar de provinciescore voor resultatenpagina
      setProvinceScore({ correct: score.correct, total: order.length || 10 });
      setSession(s => ({
        rounds: s.rounds + 1,
        correct: s.correct + score.correct,
        total: s.total + (order.length || 10),
      }));
      startRegions();
    };

    const nextQuestion = () => {
      const nextIndex = idx + 1;
      if (nextIndex >= order.length) {
        setFinished(true);
        // Bewaar de regio-score indien in regions phase
        if (phase === 'regions') {
          setRegionScore({ correct: score.correct, total: order.length || REG_KEYS.length });
        }
        try {
          localStorage.setItem(
            'bpq:last',
            JSON.stringify({ correct: score.correct, total: order.length || (phase === 'provinces' ? 10 : REG_KEYS.length), results })
          );
        } catch {}
        return;
      }
      const key = order[nextIndex];
      setIdx(nextIndex);
      setAnswerState(null);
      setHighlights([]);
      setHoverMembers([]);
      if (phase === 'provinces') {
        setQuestion({ kind: 'provinces', key: key as ProvinceKey });
        speak(`Waar ligt ${NAMES[key as ProvinceKey].nl}?`);
      } else {
        setQuestion({ kind: 'regions', key: key as RegionKey });
        speak(`Waar ligt ${key as RegionKey}?`);
      }
    };

    useEffect(() => {
      if (!loading && !error && order.length === 0) {
        startTest();
      }
    }, [loading, error]);

    const onClickProvince = (f: any) => {
      if (!question || finished) return;
      const clickedId = f.properties.id as string; // bv. BE21

      // In provincieronde: 10 provincies. In regiomodus: enkel leden van het gevraagde gewest.
      const clickable = phase === 'regions'
        ? (question?.kind === 'regions' && REGIONS[question.key].members.includes(clickedId))
        : ALLOWED_IDS.has(clickedId);
      if (!clickable) return;

      let ok = false;
      let resultKey: string = '';

      if (question.kind === 'provinces') {
        const clickedKey = ID_TO_KEY.get(clickedId)!; // provincienaam-key
        ok = clickedKey === question.key;
        resultKey = question.key;
        // highlight enkel de aangeklikte provincie
        setHighlights([clickedId]);
      } else {
        // regio: elke provincie binnen het gewest telt als juist
        const members = REGIONS[question.key as RegionKey].members;
        ok = members.includes(clickedId);
        resultKey = question.key;
        // bij juist: highlight het volledige gewest, bij fout enkel de klik
        setHighlights(ok ? members : [clickedId]);
      }

      setAnswerState({ id: clickedId, ok });
      setScore(s => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
      setResults(prev => ({ ...prev, [resultKey]: ok }));

      speak(ok ? "Juist!" : "Niet juist.");
      setTimeout(nextQuestion, 800);
    };

    return (
        <div style={styles.page}>
            <style>{baseCss + globalReset}</style>
            <div style={styles.container}>
                <div style={styles.left}>
                    <div style={{ ...styles.card, borderRadius: 0, width: '100%', height: '100%', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <MapIcon size={22} />
                            {/* Titel gewijzigd */}
                            <h1 style={{ fontSize: 20, margin: 0 }}>Toets WO</h1>
                        </div>

                        {/* Subtitel afhankelijk van fase */}
                        <div style={{ marginBottom: 12 }}>
                          <span style={{ fontSize: 16, fontWeight: 500, color: '#6366f1' }}>
                            {phase === 'provinces' && !showResults && 'Provincies'}
                            {phase === 'regions' && !showResults && 'Gewesten'}
                          </span>
                        </div>

                        {/* Resultatenpagina */}
                        {showResults ? (
                          <div style={{ ...styles.card, padding: 24, borderRadius: 16, textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
                            <h2 style={{ marginBottom: 16 }}>Resultaten</h2>
                            <div style={{ fontSize: 16, marginBottom: 12 }}>
                              Provinciescore: <b>{provinceScore.correct}/{provinceScore.total}</b>
                            </div>
                            <div style={{ fontSize: 16, marginBottom: 12 }}>
                              Gewestenscore: <b>{regionScore.correct}/{regionScore.total}</b>
                            </div>
                            <div style={{ fontSize: 18, marginBottom: 24 }}>
                              <span style={{ color: '#0f766e', fontWeight: 600 }}>
                                Totaalscore: {provinceScore.correct + regionScore.correct}/{provinceScore.total + regionScore.total}
                              </span>
                            </div>
                            <button
                              style={styles.btnPrimary}
                              onClick={() => {
                                setProvinceScore({ correct: 0, total: 0 });
                                setRegionScore({ correct: 0, total: 0 });
                                setShowResults(false);
                                startTest();
                              }}
                            >
                              Opnieuw starten
                            </button>
                          </div>
                        ) : (
                        <div style={{ ...styles.card, padding: 12, borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Flag size={18} />
                            <div style={{ fontWeight: 600 }}>
                              Klik op: {question ? (question.kind === 'provinces' ? NAMES[question.key].nl : question.key) : '...'}
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ fontSize: 12, background: '#eef2ff', padding: '4px 8px', borderRadius: 8 }}>
                                    Score: {score.correct}/{order.length || (phase === 'provinces' ? 10 : REG_KEYS.length)}
                                  </div>
                                  {session.rounds > 0 && (
                                    <div style={{ fontSize: 12, background: '#e0f2fe', padding: '4px 8px', borderRadius: 8 }}>
                                      Totaal: {session.correct}/{session.total} ({session.rounds}x)
                                    </div>
                                  )}
                                </div>
                                <button onClick={() => setSound(s => !s)} style={styles.iconBtn} aria-label="Geluid aan/uit">
                                    {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                </button>
                            </div>
                        </div>

                            <div style={styles.mapWrap}>
                                {loading && <div style={{ padding: 12 }}>Kaart laden…</div>}
                                {error && <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>}
                                {!loading && geo && (
                                    <ComposableMap projection="geoMercator" projectionConfig={{ scale: 5500, center: [4.6, 50.7] }} style={{ width: '100%', height: '100%' }}>
                                        <Geographies geography={geo}>
                                            {({ geographies }) => (
                                                <>
                                                {geographies.map((g: any) => {
                                                    const id = g.properties.id as string;
                                                    // Klikbaarheid:
                                                    // - Provincieronde: alle 10 provincies
                                                    // - Regioronde: alleen de leden van eender welk gewest zijn klikbaar/hoverbaar (niet enkel het gevraagde!)
                                                    let isClickable = false;
                                                    if (phase === 'regions') {
                                                      // id is clickable if it is a member of any region
                                                      isClickable = Object.values(REGIONS).some(region => region.members.includes(id));
                                                    } else {
                                                      isClickable = ALLOWED_IDS.has(id);
                                                    }
                                                    const isHighlighted = highlights.includes(id);

                                                    // Basiskleur
                                                    let fill = isClickable ? "#e2e8f0" : "#f1f5f9";
                                                    // Klik-feedback (juist/fout) primeert
                                                    if (isClickable && isHighlighted) {
                                                      fill = answerState?.ok ? "#c7f9cc" : "#fee2e2";
                                                    } else if (
                                                      phase === 'regions' &&
                                                      hoverMembers.includes(id)
                                                    ) {
                                                      // Bij regiovragen: hover over één lid -> kleur het hele gewest lichtblauw
                                                      fill = "#bfdbfe";
                                                    }

                                                    const stroke = "#64748b";
                                                    const onEnter = () => {
                                                      if (phase === 'regions') {
                                                        // Zoek of dit id in een regio zit
                                                        let found: string[] | null = null;
                                                        for (const region of Object.values(REGIONS)) {
                                                          if (region.members.includes(id)) {
                                                            found = region.members;
                                                            break;
                                                          }
                                                        }
                                                        if (found) setHoverMembers(found);
                                                        else setHoverMembers([]);
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
                                                                default: { fill, outline: "none", stroke, strokeWidth: 0.5, cursor: isClickable ? 'pointer' : 'default' },
                                                                hover: { fill, outline: "none" },  // we stylen hover via hoverMembers boven
                                                                pressed: { fill: isClickable ? "#93c5fd" : fill, outline: "none" },
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

                            {/* Score-overzicht onder de kaart */}
                            <div style={{ marginTop: 12 }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: '100%' }}>
                                {(phase === 'provinces' ? (ALL_KEYS as string[]) : (REG_KEYS as string[])).map((key) => {
                                  const val = results[key as string];
                                  const base = { padding: '6px 10px', borderRadius: 9999, border: '1px solid #e2e8f0', fontSize: 12 } as React.CSSProperties;
                                  let bg = '#fff', color = '#0f172a', border = '#e2e8f0';
                                  if (val === true) { bg = '#dcfce7'; border = '#86efac'; }
                                  else if (val === false) { bg = '#fee2e2'; border = '#fecaca'; }
                                  const label = phase === 'provinces' ? NAMES[key as ProvinceKey].nl : (key as RegionKey);
                                  return (
                                    <span key={key} style={{ ...base, background: bg, borderColor: border, color }}>
                                      {label}
                                    </span>
                                  );
                                })}
                              </div>

                              {/* Volgende/Resultaat-knoppen */}
                              {finished && phase === 'provinces' && (
                                <div style={{ marginTop: 12 }}>
                                  <button onClick={nextRound} style={styles.btnPrimary}>
                                    <ArrowRight size={16} style={{ marginRight: 6 }} /> Volgende
                                  </button>
                                </div>
                              )}
                              {finished && phase === 'regions' && (
                                <div style={{ marginTop: 12 }}>
                                  <button
                                    onClick={() => {
                                      setRegionScore({ correct: score.correct, total: order.length || REG_KEYS.length });
                                      setShowResults(true);
                                    }}
                                    style={styles.btnPrimary}
                                  >
                                    <ArrowRight size={16} style={{ marginRight: 6 }} /> Volgende
                                  </button>
                                </div>
                              )}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
