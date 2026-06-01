export interface Goal {
    id: string;
    title: string;
    date: string; // ISO date string YYYY-MM-DD
    description: string;
    notes: string;
    createdAt: string; // ISO datetime
    updatedAt: string; // ISO datetime
}

export type ThemeMode = 'minimalist' | 'vaporwave' | 'natural' | 'dark';
export type HorizonMode = 'hard' | 'subtle' | 'fog';
export type ControlLayout = 'float' | 'dock';

export interface AppSettings {
    theme: ThemeMode;
    horizonMode: HorizonMode;
    curvature: number; // 0 = globe, 1 = flat
    gridOverlayEnabled: boolean;
    gridLabelDensity: number; // 1 = every line, 2 = every 2nd line, etc
    simulatedDaysAhead: number; // 0 = today, positive values simulate forward days
    controlLayout: ControlLayout;
    cameraRailPosition: number; // 0 = close (week), 1 = far (year)
}
