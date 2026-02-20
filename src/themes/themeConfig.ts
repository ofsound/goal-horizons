import type { ThemeMode } from '../types/goal';

export interface ThemeConfig {
    name: string;
    // Scene
    backgroundColor: string;
    fogColor: string;
    fogNear: number;
    fogFar: number;
    // Lighting
    ambientIntensity: number;
    ambientColor: string;
    directionalIntensity: number;
    directionalColor: string;
    directionalPosition: [number, number, number];
    // Ground
    groundColor: string;
    groundEmissive: string;
    groundEmissiveIntensity: number;
    groundGridColor: string;
    showGroundGrid: boolean;
    // Sky
    skyTopColor: string;
    skyBottomColor: string;
    showStars: boolean;
    showSun: boolean;
    sunColor: string;
    sunPosition: [number, number, number];
    // Billboard
    billboardPostColor: string;
    billboardFaceColor: string;
    billboardPastFaceColor: string;
    billboardTextColor: string;
    billboardBorderColor: string;
    billboardGlowIntensity: number;
    // UI overlay
    uiBackground: string;
    uiText: string;
    uiBorder: string;
    uiAccent: string;
}

const minimalist: ThemeConfig = {
    name: 'Minimalist',
    backgroundColor: '#e8f0f5',
    fogColor: '#e8f0f5',
    fogNear: 40,
    fogFar: 200,
    ambientIntensity: 0.8,
    ambientColor: '#ffffff',
    directionalIntensity: 1.0,
    directionalColor: '#ffeedd',
    directionalPosition: [30, 50, 20],
    groundColor: '#c8d0d8',
    groundEmissive: '#000000',
    groundEmissiveIntensity: 0,
    groundGridColor: '#b0b8c0',
    showGroundGrid: false,
    skyTopColor: '#a8d4f0',
    skyBottomColor: '#e8f0f5',
    showStars: false,
    showSun: false,
    sunColor: '#ffffff',
    sunPosition: [0, 50, -100],
    billboardPostColor: '#8899aa',
    billboardFaceColor: '#f0f2f5',
    billboardPastFaceColor: '#d5d8dd',
    billboardTextColor: '#1a2a3a',
    billboardBorderColor: '#667788',
    billboardGlowIntensity: 0,
    uiBackground: 'rgba(255,255,255,0.85)',
    uiText: '#1a2a3a',
    uiBorder: 'rgba(0,0,0,0.1)',
    uiAccent: '#3b82f6',
};

const vaporwave: ThemeConfig = {
    name: 'Vaporwave',
    backgroundColor: '#1a0030',
    fogColor: '#1a0030',
    fogNear: 50,
    fogFar: 250,
    ambientIntensity: 0.4,
    ambientColor: '#b967ff',
    directionalIntensity: 0.8,
    directionalColor: '#ff71ce',
    directionalPosition: [0, 30, -50],
    groundColor: '#120024',
    groundEmissive: '#b967ff',
    groundEmissiveIntensity: 0.15,
    groundGridColor: '#01cdfe',
    showGroundGrid: true,
    skyTopColor: '#0a0020',
    skyBottomColor: '#ff71ce',
    showStars: false,
    showSun: true,
    sunColor: '#ff6ec7',
    sunPosition: [0, 15, -120],
    billboardPostColor: '#01cdfe',
    billboardFaceColor: '#1a1a2e',
    billboardPastFaceColor: '#2a2a3e',
    billboardTextColor: '#ffffff',
    billboardBorderColor: '#ff71ce',
    billboardGlowIntensity: 0.6,
    uiBackground: 'rgba(26,0,48,0.9)',
    uiText: '#e0d0ff',
    uiBorder: 'rgba(185,103,255,0.3)',
    uiAccent: '#01cdfe',
};

const natural: ThemeConfig = {
    name: 'Natural',
    backgroundColor: '#87ceeb',
    fogColor: '#c5dff0',
    fogNear: 60,
    fogFar: 220,
    ambientIntensity: 0.5,
    ambientColor: '#ffffff',
    directionalIntensity: 1.5,
    directionalColor: '#fff5e0',
    directionalPosition: [40, 60, 30],
    groundColor: '#3a8c3f',
    groundEmissive: '#1a4c1f',
    groundEmissiveIntensity: 0.05,
    groundGridColor: '#2a6c2f',
    showGroundGrid: false,
    skyTopColor: '#4a90d9',
    skyBottomColor: '#87ceeb',
    showStars: false,
    showSun: true,
    sunColor: '#fffbe0',
    sunPosition: [40, 60, -80],
    billboardPostColor: '#6b4226',
    billboardFaceColor: '#f5f0e8',
    billboardPastFaceColor: '#d8d4cc',
    billboardTextColor: '#2a2218',
    billboardBorderColor: '#4a3020',
    billboardGlowIntensity: 0,
    uiBackground: 'rgba(255,255,255,0.88)',
    uiText: '#1a3a1a',
    uiBorder: 'rgba(0,80,0,0.15)',
    uiAccent: '#2d8a4e',
};

const dark: ThemeConfig = {
    name: 'Dark / Space',
    backgroundColor: '#050510',
    fogColor: '#050510',
    fogNear: 80,
    fogFar: 300,
    ambientIntensity: 0.2,
    ambientColor: '#4040a0',
    directionalIntensity: 0.5,
    directionalColor: '#8080ff',
    directionalPosition: [0, 40, -30],
    groundColor: '#0a0a20',
    groundEmissive: '#1a1a4a',
    groundEmissiveIntensity: 0.3,
    groundGridColor: '#2a2a5a',
    showGroundGrid: true,
    skyTopColor: '#020208',
    skyBottomColor: '#0a0a2a',
    showStars: true,
    showSun: false,
    sunColor: '#ffffff',
    sunPosition: [0, 50, -100],
    billboardPostColor: '#4a4a8a',
    billboardFaceColor: '#12122e',
    billboardPastFaceColor: '#1a1a3a',
    billboardTextColor: '#e0e0ff',
    billboardBorderColor: '#6a6aaa',
    billboardGlowIntensity: 1.0,
    uiBackground: 'rgba(10,10,30,0.92)',
    uiText: '#c0c0ff',
    uiBorder: 'rgba(100,100,200,0.2)',
    uiAccent: '#a78bfa',
};

export const themes: Record<ThemeMode, ThemeConfig> = {
    minimalist,
    vaporwave,
    natural,
    dark,
};

export function getTheme(mode: ThemeMode): ThemeConfig {
    return themes[mode];
}
