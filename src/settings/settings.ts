import { defaultSettings } from '@/settings/default-settings';
import { deepMerge } from '@/utils/object-utils';

import EventEmitter2 from 'eventemitter2';
import { Component, normalizePath } from 'obsidian';

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
    private saveTimeout?: NodeJS.Timeout | undefined;
    private saveResolve?: (() => void) | undefined;

    constructor(public readonly plugin: IzdPlugin) {
        super();
        this.emitter = new EventEmitter2({
            wildcard: true,
            delimiter: '.',
        });
        this.setupEvents();
    }

    get $() {
        return this.data;
    }

    async load(): Promise<void> {
        const userSettings = (await this.plugin.loadData()) ?? {};
        const settings = deepMerge(defaultSettings(), userSettings);

        // reactive settings: `$.units.*** = ...` -> `emit('settings.units.***', (payload))`
        this.data = createSettingsProxy(this, { ...settings }, []);

        // to get typed settings event paths: `$$.units.$path` -> `settings.units`
        this.$$ = createEventsWrapper(settings);
    }

    async save(): Promise<void> {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.savePromise ??= new Promise((resolve) => {
            this.saveResolve = resolve;
        });

        this.saveTimeout = setTimeout(async () => {
            try {
                await this.plugin.saveData(this.$);
                this.dirty = false;
            } catch (err: any) {
                this.plugin.logger.error(
                    `Settings save failed: ${err.message}`
                );
            } finally {
                this.savePromise = undefined;
                this.saveResolve?.();
                this.saveResolve = undefined;
                this.saveTimeout = undefined;
            }
        }, 50);

        return this.savePromise;
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

    async onunload(): Promise<void> {
        super.onunload();
        this.emitter.removeAllListeners();

        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = undefined;
        }

        if (this.dirty && this.savePromise) {
            await this.savePromise;
        } else if (this.dirty) {
            await this.plugin.saveData(this.$);
            this.dirty = false;
        }

        this.savePromise = undefined;
    }
}
