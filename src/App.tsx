import React, {useEffect, useState} from "react";
import CapitalsQuiz from "./components/CapitalsQuiz";
import MapQuiz from "./components/MapQuiz";
import Results from "./components/Results";
import Header from "./components/Header";
import Footer from "./components/Footer";

import {baseCss, globalReset, NUTS2_GEOJSON_URL, styles} from "./data/constants";
import {
    ALLOWED_IDS,
    BRUSSELS_CAPITAL,
    CAPITAL_KEYS,
    CAPITAL_VALUES,
    CAPITALS,
    FLEMISH_KEYS,
    ID_TO_KEY,
    NAMES,
    type ProvinceKey,
    REG_KEYS,
    type RegionKey,
    REGIONS,
    WALLOON_KEYS,
} from "./data/provinces";
import useSpeech from "./hooks/useSpeech";

/**
 * 🇧🇪 Toets WO – Provincies, Gewesten, Hoofdplaatsen (NL)
 *
 * Robuust: gebruikt NUTS2 **IDs** i.p.v. namen om clicks te herkennen.
 * - Alleen de 10 provincies zijn klikbaar (Brussel wordt genegeerd in provinciemodus)
 * - Feedback/spraak enkel NL
 */

// Klein hulpfunctie om volgorde te schudden
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Types voor de vraagstelling
type Question = { kind: "provinces"; key: ProvinceKey } | { kind: "regions"; key: RegionKey };

export default function App() {
    const [sound, setSound] = useState(true);
    const [question, setQuestion] = useState<Question | null>(null);
    const [score, setScore] = useState({correct: 0, total: 0});
    const [answerState, setAnswerState] = useState<{ id: string; ok: boolean } | null>(null);
    const [highlights, setHighlights] = useState<string[]>([]);
    // Hover-highlight voor regiovragen (toon hele gewest op hover)
    const [hoverMembers, setHoverMembers] = useState<string[]>([]);

    // Totaalscore over meerdere ronden
    const [session, setSession] = useState({rounds: 0, correct: 0, total: 0});

    // Eén keer alle provincies: volgorde + index + resultaten
    const [order, setOrder] = useState<string[]>([]);
    const [idx, setIdx] = useState(0);
    const [results, setResults] = useState<Record<string, boolean | null>>({});
    const [finished, setFinished] = useState(false);
    const [phase, setPhase] = useState<"provinces" | "regions" | "capitals">("provinces");

    // Nieuw: eindresultaten tonen
    const [showResults, setShowResults] = useState(false);
    // Scores opslaan voor eindresultaten
    const [provinceScore, setProvinceScore] = useState<{ correct: number; total: number }>({correct: 0, total: 0});
    const [regionScore, setRegionScore] = useState<{ correct: number; total: number }>({correct: 0, total: 0});

    // ---- Hoofdplaatsen DnD state ----
    type CapitalRow = {
        province: ProvinceKey | null;
        capital: string | null;
        evaluated?: boolean;
        correct?: boolean; // full-row ok (compat)
        correctProvince?: boolean; // 0,5 pt: provincie in juiste helft
        correctCapital?: boolean; // 0,5 pt: hoofdstad matcht provincie (of Brussel in rij 11)
    };
    const [capProvincesPool, setCapProvincesPool] = useState<ProvinceKey[]>([]);
    const [capCapitalsPool, setCapCapitalsPool] = useState<string[]>([]);
    const [capRows, setCapRows] = useState<CapitalRow[]>([]);
    const [dragItem, setDragItem] = useState<{ kind: "province" | "capital"; value: string } | null>(null);
    const [capitalScore, setCapitalScore] = useState<{ correct: number; total: number }>({correct: 0, total: 10});

    // Start hoofdplaatsen oefening
    const startCapitals = () => {
        setPhase("capitals");
        const provPool = shuffle(CAPITAL_KEYS);
        const capPool = shuffle([...CAPITAL_VALUES, BRUSSELS_CAPITAL]);
        setCapProvincesPool(provPool);
        setCapCapitalsPool(capPool);
        setCapRows(Array.from({length: CAPITAL_KEYS.length + 1}, () => ({province: null, capital: null})));
        setCapitalScore({correct: 0, total: CAPITAL_KEYS.length + 0.5});
        setScore({correct: 0, total: CAPITAL_KEYS.length + 0.5});
        setFinished(false);
        setAnswerState(null);
        setHighlights([]);
        setHoverMembers([]);
        setShowResults(false);
        speak("Sleep de provincies en hun hoofdplaatsen naar de juiste vakjes.");
    };

    // Kaart laden
    const [geo, setGeo] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const speak = useSpeech(sound);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(NUTS2_GEOJSON_URL, {cache: "no-store"});
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const gj = await res.json();
                const features = gj.features.filter((f: any) => (f.properties?.id ?? "").startsWith("BE"));
                setGeo({...gj, features});
            } catch (e: any) {
                setError(`Kon kaartdata niet laden: ${e?.message ?? e}`);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // (Her)start de test: alle 10 provincies exact 1x
    const startTest = () => {
        const o = shuffle((Object.keys(NAMES) as ProvinceKey[]) as unknown as string[]);
        setPhase("provinces");
        setOrder(o);
        setIdx(0);
        setResults(Object.fromEntries((Object.keys(NAMES) as ProvinceKey[]).map(k => [k, null])));
        setScore({correct: 0, total: 0});
        setAnswerState(null);
        setHighlights([]);
        setHoverMembers([]);
        setFinished(false);
        setShowResults(false);
        setQuestion({kind: "provinces", key: o[0] as ProvinceKey});
        speak(`Waar ligt ${NAMES[o[0] as ProvinceKey].nl}?`);
    };

    const startRegions = () => {
        const o = shuffle(REG_KEYS as unknown as string[]);
        setPhase("regions");
        setOrder(o);
        setIdx(0);
        setResults(Object.fromEntries((REG_KEYS as RegionKey[]).map(k => [k, null])));
        setScore({correct: 0, total: 0});
        setAnswerState(null);
        setHighlights([]);
        setHoverMembers([]);
        setFinished(false);
        setQuestion({kind: "regions", key: o[0] as RegionKey});
        speak(`Waar ligt ${o[0] as RegionKey}?`);
    };

    // Sla de huidige ronde op in sessie en spring naar volgende onderdeel
    const nextRound = () => {
        if (phase === "provinces") setProvinceScore({correct: score.correct, total: order.length || 10});
        if (phase === "regions") setRegionScore({correct: score.correct, total: order.length || REG_KEYS.length});
        setSession(s => ({
            rounds: s.rounds + 1,
            correct: s.correct + score.correct,
            total: s.total + (order.length || (phase === "provinces" ? 10 : phase === "regions" ? REG_KEYS.length : CAPITAL_KEYS.length)),
        }));
        if (phase === "provinces") startRegions();
        else if (phase === "regions") startCapitals();
    };

    const nextQuestion = () => {
        const nextIndex = idx + 1;
        if (nextIndex >= order.length) {
            setFinished(true);
            // Bewaar de regio-score indien in regions phase
            if (phase === "regions") {
                setRegionScore({correct: score.correct, total: order.length || REG_KEYS.length});
            }
            try {
                localStorage.setItem(
                    "bpq:last",
                    JSON.stringify({
                        correct: score.correct,
                        total: order.length || (phase === "provinces" ? 10 : REG_KEYS.length),
                        results
                    })
                );
            } catch {
            }
            return;
        }
        const key = order[nextIndex];
        setIdx(nextIndex);
        setAnswerState(null);
        setHighlights([]);
        setHoverMembers([]);
        if (phase === "provinces") {
            setQuestion({kind: "provinces", key: key as ProvinceKey});
            speak(`Waar ligt ${NAMES[key as ProvinceKey].nl}?`);
        } else {
            setQuestion({kind: "regions", key: key as RegionKey});
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
        const clickable = phase === "regions"
            ? (question?.kind === "regions" && REGIONS[question.key].members.includes(clickedId))
            : ALLOWED_IDS.has(clickedId);
        if (!clickable) return;

        let ok = false;
        let resultKey: string = "";

        if (question.kind === "provinces") {
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

        setAnswerState({id: clickedId, ok});
        setScore(s => ({correct: s.correct + (ok ? 1 : 0), total: s.total + 1}));
        setResults(prev => ({...prev, [resultKey]: ok}));

        speak(ok ? "Juist!" : "Niet juist.");
        setTimeout(nextQuestion, 800);
    };

    return (
        <div style={styles.page}>
            <style>{baseCss + globalReset}</style>
            <div style={styles.container}>
                <div style={styles.left}>
                    <div style={{
                        ...styles.card,
                        borderRadius: 0,
                        width: "100%",
                        height: "100%",
                        boxSizing: "border-box"
                    }}>
                        <Header
                            phase={phase}
                            showResults={showResults}
                            question={question as any}
                            NAMES={NAMES as any}
                            session={session}
                            sound={sound}
                            setSound={setSound}
                            score={score}
                            capitalScore={capitalScore}
                            orderLen={order.length || 10}
                            regLen={REG_KEYS.length}
                        />

                        {/* Resultatenpagina */}
                        {showResults ? (
                            <Results
                                provinceScore={provinceScore}
                                regionScore={regionScore}
                                capitalScore={capitalScore}
                                regCount={REG_KEYS.length}
                                onRestart={() => {
                                    setProvinceScore({correct: 0, total: 0});
                                    setRegionScore({correct: 0, total: 0});
                                    setCapitalScore({correct: 0, total: 10});
                                    setShowResults(false);
                                    startTest();
                                }}
                            />
                        ) : (
                            <div style={{...styles.card, padding: 12, borderRadius: 12}}>
                                {phase !== "capitals" ? (
                                    <MapQuiz
                                        phase={phase as "provinces" | "regions"}
                                        geo={geo}
                                        loading={loading}
                                        error={error}
                                        NAMES={NAMES as any}
                                        REGIONS={REGIONS as any}
                                        REG_KEYS={REG_KEYS}
                                        ALLOWED_IDS={ALLOWED_IDS}
                                        question={question as any}
                                        answerState={answerState}
                                        results={results}
                                        highlights={highlights}
                                        hoverMembers={hoverMembers}
                                        setHoverMembers={setHoverMembers}
                                        onClickProvince={onClickProvince}
                                        nextRound={nextRound}
                                        finished={finished}
                                    />
                                ) : (
                                    <CapitalsQuiz
                                        NAMES={NAMES}
                                        CAPITALS={CAPITALS}
                                        FLEMISH_KEYS={FLEMISH_KEYS}
                                        WALLOON_KEYS={WALLOON_KEYS}
                                        BRUSSELS_CAPITAL={BRUSSELS_CAPITAL}
                                        capProvincesPool={capProvincesPool}
                                        setCapProvincesPool={setCapProvincesPool}
                                        capCapitalsPool={capCapitalsPool}
                                        setCapCapitalsPool={setCapCapitalsPool}
                                        capRows={capRows}
                                        setCapRows={setCapRows}
                                        dragItem={dragItem}
                                        setDragItem={setDragItem}
                                        capitalScore={capitalScore}
                                        setCapitalScore={setCapitalScore}
                                        setScore={setScore}
                                        finished={finished}
                                        setFinished={setFinished}
                                        setShowResults={setShowResults}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Footer met versienummer */}
            <Footer/>
        </div>
    );
}
