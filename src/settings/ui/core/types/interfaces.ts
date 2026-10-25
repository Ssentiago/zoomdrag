import React from 'react';

import { App } from 'obsidian';

import IzdPlugin from '../../../../core/izd-plugin';
import { UndoRedoApi } from '../../hooks/types/interfaces';

export type UndoRedoContextProps<T> = UndoRedoApi<T>;

export interface SettingsContextProps {
    plugin: IzdPlugin;
    app: App;
    forceReload: () => void;
    reloadCount: number;
}

export interface SettingProviderProps {
    app: App;
    plugin: IzdPlugin;
    children: React.ReactNode;
}

export interface CreateHistoryContextReturn<T extends readonly unknown[]> {
    HistoryProvider: (props: {
        state: T;
        updateState: (state: T) => Promise<void>;
        children: React.ReactNode;
    }) => React.ReactElement;
    useHistoryContext: () => UndoRedoContextProps<T>;
}
