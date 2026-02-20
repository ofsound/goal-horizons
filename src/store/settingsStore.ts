import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, ThemeMode, HorizonMode, ControlLayout } from '../types/goal';
import { horizonModeToCurvature } from '../utils/globe';

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function clampSimulatedDays(value: number): number {
    return Math.max(0, Math.min(3650, Math.round(value)));
}

function clampGridLabelDensity(value: number): number {
    const v = Math.round(value);
    return Math.max(1, Math.min(3, v));
}

interface SettingsStore extends AppSettings {
    setTheme: (theme: ThemeMode) => void;
    setHorizonMode: (mode: HorizonMode) => void;
    setCurvature: (curvature: number) => void;
    setGridOverlayEnabled: (enabled: boolean) => void;
    setGridLabelDensity: (density: number) => void;
    setSimulatedDaysAhead: (days: number) => void;
    setControlLayout: (layout: ControlLayout) => void;
    setCameraRailPosition: (position: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            theme: 'minimalist',
            horizonMode: 'hard',
            curvature: 0,
            gridOverlayEnabled: false,
            gridLabelDensity: 1,
            simulatedDaysAhead: 0,
            controlLayout: 'float',
            cameraRailPosition: 0.3, // Start at roughly 1 month view

            setTheme: (theme) => set({ theme }),
            setHorizonMode: (mode) => set({ horizonMode: mode }),
            setCurvature: (curvature) => set({ curvature: clamp01(curvature) }),
            setGridOverlayEnabled: (enabled) => set({ gridOverlayEnabled: enabled }),
            setGridLabelDensity: (density) => set({ gridLabelDensity: clampGridLabelDensity(density) }),
            setSimulatedDaysAhead: (days) => set({ simulatedDaysAhead: clampSimulatedDays(days) }),
            setControlLayout: (layout) => set({ controlLayout: layout }),
            setCameraRailPosition: (position) => set({ cameraRailPosition: clamp01(position) }),
        }),
        {
            name: 'goal-horizons-settings',
            version: 4,
            migrate: (persistedState) => {
                const state = (persistedState ?? {}) as Partial<AppSettings>;
                const horizonMode = state.horizonMode ?? 'hard';
                return {
                    theme: state.theme ?? 'minimalist',
                    horizonMode,
                    curvature: clamp01(state.curvature ?? horizonModeToCurvature(horizonMode)),
                    gridOverlayEnabled: state.gridOverlayEnabled ?? false,
                    gridLabelDensity: clampGridLabelDensity(state.gridLabelDensity ?? 1),
                    simulatedDaysAhead: clampSimulatedDays(state.simulatedDaysAhead ?? 0),
                    controlLayout: state.controlLayout ?? 'float',
                    cameraRailPosition: clamp01(state.cameraRailPosition ?? 0.3),
                };
            },
        }
    )
);
