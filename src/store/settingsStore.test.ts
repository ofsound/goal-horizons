import { describe, expect, it } from 'vitest';
import { migrateSettings } from './settingsStore';

describe('settings store migration', () => {
    it('fills defaults for missing persisted settings', () => {
        expect(migrateSettings({})).toEqual({
            theme: 'minimalist',
            horizonMode: 'hard',
            curvature: 0,
            gridOverlayEnabled: false,
            gridLabelDensity: 1,
            simulatedDaysAhead: 0,
            controlLayout: 'float',
            cameraRailPosition: 0.3,
        });
    });

    it('clamps persisted numeric settings into supported ranges', () => {
        expect(
            migrateSettings({
                horizonMode: 'fog',
                curvature: 3,
                gridLabelDensity: 12,
                simulatedDaysAhead: 5000,
                cameraRailPosition: -1,
            }),
        ).toMatchObject({
            horizonMode: 'fog',
            curvature: 1,
            gridLabelDensity: 3,
            simulatedDaysAhead: 3650,
            cameraRailPosition: 0,
        });
    });

    it('derives curvature from older horizon-mode-only settings', () => {
        expect(migrateSettings({ horizonMode: 'subtle' }).curvature).toBe(0.5);
    });
});
