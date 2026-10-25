import { DimensionType } from './definitions';

export interface ImageConfig {
    name: string;
    selector: string;
    on: boolean;
    panels: {
        [key: string]: {
            on: boolean;
        };
    };
}
export interface DragItem {
    panelName: string;
    offsetX: number;
    offsetY: number;
}

export interface PanelPosition {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
}

export interface PanelConfig {
    enabled: boolean;
    position: PanelPosition;
}

export interface PanelsConfig {
    service: PanelConfig;
    move: PanelConfig;
    zoom: PanelConfig;
}

export interface DimensionSetting {
    width: {
        value: number;
        type: DimensionType;
    };
    height: {
        value: number;
        type: DimensionType;
    };
}

export enum PanelsTriggering {
    ALWAYS = 'always',
    HOVER = 'hover',
    FOCUS = 'focus',
}

export interface Position {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
}

export interface Panels {
    global: {
        triggering: {
            mode: PanelsTriggering;
            ignoreService: boolean;
        };
    };
    local: {
        panels: {
            service: {
                on: boolean;
                buttons: {
                    hide: boolean;
                    fullscreen: boolean;
                };
                position: Position;
            };
            move: {
                on: boolean;
                buttons: {
                    up: boolean;
                    down: boolean;
                    left: boolean;
                    right: boolean;
                    upLeft: boolean;
                    upRight: boolean;
                    downLeft: boolean;
                    downRight: boolean;
                };
                position: Position;
            };
            zoom: {
                on: boolean;
                buttons: {
                    in: boolean;
                    out: boolean;
                    reset: boolean;
                };
                position: Position;
            };
        };
        preset: 'minimal' | 'full' | 'presentation' | 'none';
    };
}

export interface Interactivity {
    markdown: {
        autoDetect: boolean;
    };
    picker: {
        enabled: boolean;
    };
}

interface UnitContextMenu {
    showForDiagrams: boolean;
    showForOtherImages: boolean;
}

export interface Units {
    configs: ImageConfig[];
    interactivity: Interactivity;
    contextMenu: UnitContextMenu;
    settingsPagination: {
        perPage: number;
    };
    folding: {
        foldByDefault: boolean;
        autoFoldOnFocusChange: boolean;
    };
    size: {
        expanded: DimensionSetting;
        folded: DimensionSetting;
    };
    exclusions: {
        patterns: string;
    };
}

export enum DebugLevel {
    None = 'none',
    Debug = 'debug',
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
}

interface Debug {
    enabled: boolean;
    level: DebugLevel;
}

export interface DefaultSettings {
    panels: Panels;
    units: Units;
    debug: Debug;
}

export interface MigrationResult {
    success: boolean;
    version: string;
    data?: DefaultSettings;
    errors?: string[];
}

export interface SettingsEventPayload {
    eventName: string;
    oldValue: unknown;
    newValue: unknown;
}
