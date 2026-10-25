import { SourceData } from '@/modes/integrated-mode/integrated-unit/types/interfaces';

import { View } from 'obsidian';

import ImageIndexer from '../leaf-index/image-indexer';

export interface LeafIndexData {
    imageIndex: Map<HTMLImageElement | SVGElement, BaseUnitContext>;
    indexer: ImageIndexer | undefined;
}
export interface BaseUnitContext {
    element: SVGElement | HTMLImageElement;
    elementType: 'svg' | 'img';
    origin: 'generated' | 'local' | 'external';
    mode: 'preview' | 'live-preview';
    sourceData: SourceData;
}
export interface LeafContext {
    id: string;
    view: View;
}

export interface SystemInfo {
    timestamp: string;
    session_start: boolean;
    obsidian: {
        version: string;
        title: string;
        enabledPlugins_count: number;
        enabledPlugins_list: string[];
        vault_name: string;
        is_mobile: boolean;
        is_desktop: boolean;
    };
    system: {
        platform: string;
        userAgent: string;
        language: string;
        screen_resolution: string;
        viewport_size: string;
        timezone: string;
        online_status: boolean;
        cpu_cores: string | number;
        device_memory: number | 'unknown';
        connection_type: string;
    };
    plugin: {
        name: string;
        version: string;
        minAppVersion: string;
        id: string;
        author: string;
        description: string;
    };
    performance: {
        memory_used: number | 'unknown';
        memory_total: number | 'unknown';
        memory_limit: number | 'unknown';
        load_time: number;
    };
    storage: {
        localStorage_usage: string;
    };
}

export interface ShortSystemInfo {
    timestamp: string;
    obsidian: {
        version: string;
        vault_name: string;
        is_mobile: boolean;
    };
    system: {
        platform: string;
        language: string;
        timezone: string;
    };
    plugin: {
        name: string;
        version: string;
        id: string;
    };
}
