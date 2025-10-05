// src/data/constants.ts
import type React from 'react';

export const NUTS2_GEOJSON_URL =
    "https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v2/2021/4326/20M/nutsrg_2.json";

export const baseCss = `
  .ok { filter: drop-shadow(0 0 0.35rem rgba(34,197,94,0.7)); }
  .nok { filter: drop-shadow(0 0 0.35rem rgba(239,68,68,0.7)); }
`;

export const globalReset = `
  html, body, #root { height: 100%; margin: 0; padding: 0; overflow-x: hidden; }
  *, *::before, *::after { box-sizing: border-box; }
  /* mobile polish */
  * { -webkit-tap-highlight-color: transparent; }
  button, input, select { font-size: 16px; touch-action: manipulation; }
  html, body { overscroll-behavior: contain; }
`;

export const styles: Record<string, React.CSSProperties> = {
    page: {
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc, #eef2f7)',
        color: '#0f172a',
        padding: 0,
        margin: 0,
        overflowX: 'hidden',
        overflowY: 'auto',        // <— voor mobiel scrollen
    },
    container: {
        width: '100%',
        height: '100%',
        margin: 0,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 0,
        overflow: 'hidden'
    },
    left: { width: '100%', height: '100%', overflow: 'auto' }, // was 'hidden'
    right: {display: 'grid', gap: 16},
    card: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 0,
        padding: 16,
        boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
        width: '100%',
        maxWidth: '100%'
    },
    controlsRow: {display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'},
    label: {display: 'block', fontSize: 12, color: '#475569', marginBottom: 4},
    btnPrimary: {
        padding: '6px 10px',
        marginRight: 6,
        borderRadius: 8,
        border: '1px solid #4f46e5',
        background: '#6366f1',
        color: '#fff',
        cursor: 'pointer'
    },
    btnGhost: {
        padding: '6px 10px',
        marginRight: 6,
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        background: '#fff',
        cursor: 'pointer'
    },
    btnSecondary: {
        padding: '6px 10px',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        background: '#f1f5f9',
        cursor: 'pointer'
    },
    btnOutline: {
        padding: '6px 10px',
        borderRadius: 8,
        border: '1px solid #94a3b8',
        background: '#fff',
        cursor: 'pointer'
    },
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
    mapWrap: { width: '100%', height: '60vh', borderRadius: 12, overflow: 'hidden', background: '#f8fafc' },
    input: {flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1'},
    grid: {display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8},
    tile: {
        textAlign: 'left',
        padding: 10,
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        background: '#fff',
        cursor: 'pointer'
    },
};
