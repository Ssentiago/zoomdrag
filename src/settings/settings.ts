import { defaultSettings } from '@/settings/default-settings';
import { deepMerge } from '@/utils/object-utils';

import EventEmitter2 from 'eventemitter2';
import { Component, debounce, normalizePath } from 'obsidian';

import IzdPlugin from '../core/izd-plugin';
import { createEventsWrapper } from './proxy/events-wrapper';
import { createSettingsProxy } from './proxy/settings-proxy';
import { EventsWrapper } from './proxy/types/definitions';
import { DefaultSettings } from './types/interfaces';

export default class Settings extends Component {
    dirty = false;
    private data!: DefaultSettings;

    readonly emitter: EventEmitter2;
    $$!: EventsWrapper<DefaultSettings>;

    private savePromise?: Promise<void> | undefined;
    private saveResolve?: (() => void) | undefined;
    private readonly debouncedSave: () => void;

    constructor(public readonly plugin: IzdPlugin) {
        super();
        this.emitter = new EventEmitter2({
            wildcard: true,
            delimiter: '.',
        });
        this.debouncedSave = debounce(
            () => this.performSave(),
            50,
            true
        );
        this.setupEvents();
    }

    get $(): DefaultSettings {
        return this.data;
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- must be awaitable by callers (izd-plugin.onload, reset)
    async load(): Promise<void> {
        const userSettings = (await this.plugin.loadData()) ?? {};
        const settings = deepMerge(defaultSettings(), userSettings);

        // reactive settings: `$.units.*** = ...` -> `emit('settings.units.***', (payload))`
        this.data = createSettingsProxy(this, { ...settings }, []);

        // to get typed settings event paths: `$$.units.$path` -> `settings.units`
        this.$$ = createEventsWrapper(settings);
    }

    save(): Promise<void> {
        this.savePromise ??= new Promise((resolve) => {
            this.saveResolve = resolve;
        });
        this.debouncedSave();
        return this.savePromise;
    }

    private async performSave(): Promise<void> {
        try {
            await this.plugin.saveData(this.$);
            this.dirty = false;
        } catch (err: unknown) {
            this.plugin.logger.error(
                `Settings save failed: ${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            const resolve = this.saveResolve;
            this.savePromise = undefined;
            this.saveResolve = undefined;
            resolve?.();
        }
    }

    async reset(): Promise<void> {
        const pluginPath = this.plugin.manifest.dir;

        if (!pluginPath) {
            throw new Error('Zoomdrag: `No plugin dir found`');
        }

        const configPath = normalizePath(`${pluginPath}/data.json`);
        const existsPath =
            await this.plugin.app.vault.adapter.exists(configPath);
        existsPath && (await this.plugin.app.vault.adapter.remove(configPath));
        await this.load();
    }

    setupEvents(): void {
        this.emitter.on('**', () => (this.dirty = true));
    }

    onunload(): void {
        super.onunload();
        this.emitter.removeAllListeners();

        void (async () => {
            if (this.dirty) {
                await this.performSave();
            }
        })();
    }
}
