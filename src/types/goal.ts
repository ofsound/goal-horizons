export type Priority = 'low' | 'medium' | 'high';

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface SubTask {
    id: string;
    title: string;
    done: boolean;
}

export interface Goal {
    id: string;
    title: string;
    date: string; // ISO date string YYYY-MM-DD
    category: string; // Category ID
    priority: Priority;
    description: string;
    isRecurring: boolean;
    recurrenceRule?: RecurrenceRule;
    recurrenceEndDate?: string;
    subTasks: SubTask[];
    progressPercent: number; // 0-100
    tags: string[];
    links: string[];
    notes: string;
    timeOfDay?: string; // HH:MM
    createdAt: string; // ISO datetime
    updatedAt: string; // ISO datetime
}

export interface Category {
    id: string;
    name: string;
    color: string; // hex color
}

export type ThemeMode = 'minimalist' | 'vaporwave' | 'natural' | 'dark';
export type HorizonMode = 'hard' | 'subtle' | 'fog';
export type ControlLayout = 'float' | 'dock';

export interface AppSettings {
    theme: ThemeMode;
    horizonMode: HorizonMode;
    curvature: number; // 0 = globe, 1 = flat
    gridOverlayEnabled: boolean;
    controlLayout: ControlLayout;
    cameraRailPosition: number; // 0 = close (week), 1 = far (year)
}

export interface FilterState {
    categories: string[]; // category IDs to show (empty = show all)
    priorities: Priority[]; // priorities to show (empty = show all)
    searchQuery: string;
}
