// src/data/provinces.ts

export type ProvinceKey =
    | "Antwerpen"
    | "Limburg"
    | "Oost-Vlaanderen"
    | "Vlaams-Brabant"
    | "West-Vlaanderen"
    | "Waals-Brabant"
    | "Henegouwen"
    | "Luik"
    | "Luxemburg"
    | "Namen";

export type RegionKey = 'Vlaams Gewest' | 'Waals Gewest' | 'Brussels Hoofdstedelijk Gewest';

// Provincies met vaste NUTS2 IDs (Brussel = BE10 → niet opnemen)
export const NAMES: Record<ProvinceKey, { nl: string; en: string; id: string }> = {
    Antwerpen: {nl: "Antwerpen", en: "Antwerp", id: "BE21"},
    Limburg: {nl: "Limburg", en: "Limburg", id: "BE22"},
    "Oost-Vlaanderen": {nl: "Oost-Vlaanderen", en: "East Flanders", id: "BE23"},
    "Vlaams-Brabant": {nl: "Vlaams-Brabant", en: "Flemish Brabant", id: "BE24"},
    "West-Vlaanderen": {nl: "West-Vlaanderen", en: "West Flanders", id: "BE25"},
    "Waals-Brabant": {nl: "Waals-Brabant", en: "Walloon Brabant", id: "BE31"},
    Henegouwen: {nl: "Henegouwen", en: "Hainaut", id: "BE32"},
    Luik: {nl: "Luik", en: "Liège", id: "BE33"},
    Luxemburg: {nl: "Luxemburg", en: "Luxembourg", id: "BE34"},
    Namen: {nl: "Namen", en: "Namur", id: "BE35"},
};

export const REGIONS: Record<RegionKey, { members: string[] }> = {
    'Vlaams Gewest': {members: ['BE21', 'BE22', 'BE23', 'BE24', 'BE25']}, // Vlaanderen
    'Waals Gewest': {members: ['BE31', 'BE32', 'BE33', 'BE34', 'BE35']},  // Wallonië
    'Brussels Hoofdstedelijk Gewest': {members: ['BE10']},            // Brussel
};

export const REG_KEYS = Object.keys(REGIONS) as RegionKey[];

export const ALLOWED_IDS = new Set(Object.values(NAMES).map(v => v.id));
export const ID_TO_KEY = new Map<string, keyof typeof NAMES>(Object.entries(NAMES).map(([k, v]) => [v.id, k as keyof typeof NAMES]));

// Helpers voor regio-indeling (provincies per gewest)
export const FLEMISH_IDS = REGIONS['Vlaams Gewest'].members;
export const WALLOON_IDS = REGIONS['Waals Gewest'].members;
export const FLEMISH_KEYS = FLEMISH_IDS.map(id => ID_TO_KEY.get(id)!).filter(Boolean) as ProvinceKey[];
export const WALLOON_KEYS = WALLOON_IDS.map(id => ID_TO_KEY.get(id)!).filter(Boolean) as ProvinceKey[];

// Hoofdplaatsen
export const CAPITALS: Record<ProvinceKey, string> = {
    Antwerpen: 'Antwerpen',
    Limburg: 'Hasselt',
    'Oost-Vlaanderen': 'Gent',
    'Vlaams-Brabant': 'Leuven',
    'West-Vlaanderen': 'Brugge',
    'Waals-Brabant': 'Waver',
    Henegouwen: 'Bergen',
    Luik: 'Luik',
    Luxemburg: 'Aarlen',
    Namen: 'Namen',
};
export const CAPITAL_KEYS = Object.keys(CAPITALS) as ProvinceKey[];
export const CAPITAL_VALUES = Object.values(CAPITALS) as string[];
export const BRUSSELS_CAPITAL = 'Brussel';
