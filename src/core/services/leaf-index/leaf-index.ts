import IzdPlugin from '@/core/izd-plugin';
import { SettingsEventPayload } from '@/settings/types/interfaces';

import { Component, MarkdownView } from 'obsidian';

import {
    BaseUnitContext,
    LeafContext,
    LeafIndexData,
} from '../types/interfaces';
import ImageIndexer from './image-indexer';

export default class LeafIndex extends Component {
    data: Map<string, LeafIndexData> = new Map();
    activeLeafContext: LeafContext | undefined;
    pathsCache: string[];

    constructor(readonly plugin: IzdPlugin) {
        super();
        this.pathsCache =
            this.plugin.settings.$.units.exclusions.patterns.split('\n');
        this.load();
        this.setupOwnEventsHandler();
        this.setupObsidianEventHandlers();
    }

    /**
     *
     */
    private setupObsidianEventHandlers(): void {
        this.plugin.app.workspace.on('layout-change', () => {
            void this.updateIndex();
        });
        this.plugin.app.workspace.on('active-leaf-change', () => {
            void this.updateIndex();
        });
    }
    private setupOwnEventsHandler() {
        this.plugin.emitter.on(
            this.plugin.settings.$$.units.exclusions.patterns.$path,
            (e: SettingsEventPayload) => {
                const oldValue = e.oldValue as string;
                const newValue = e.newValue as string;
                if (oldValue !== newValue) {
                    this.pathsCache = newValue.split('\n');
                }
            }
        );
    }

    private async updateIndex(): Promise<void> {
        await this.cleanupActiveLeaf();
        await this.initializeActiveLeaf();
        await this.setupImageIndexer();
    }

    private async setupImageIndexer(): Promise<void> {
        if (!this.activeLeafContext?.id) {
            return;
        }
        const data = this.data.get(this.activeLeafContext.id);
        if (!data) {
            return;
        }

        if (data.indexer) {
            return;
        }

        data.indexer = new ImageIndexer(this);
        data.indexer.enable();
    }

    onunload(): void {
        void (async () => {
            for (const leafID of this.data.keys()) {
                await this.cleanupLeafData(leafID);
            }
        })();
    }

    private async initializeActiveLeaf(): Promise<void> {
        const view =
            this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }

        if (this.isExcluded(view.file?.path)) {
            return;
        }

        this.activeLeafContext = {
            id: view.leaf.id,
            view,
        };

        this.initializeLeafData(this.activeLeafContext);
    }

    private async cleanupActiveLeaf(): Promise<void> {
        if (!this.activeLeafContext?.id) {
            return;
        }

        const isLeafAlive = this.plugin.app.workspace.getLeafById(
            this.activeLeafContext.id
        );
        if (isLeafAlive === null) {
            await this.cleanupLeafData(this.activeLeafContext.id);
            this.activeLeafContext = undefined;
        }
    }

    private initializeLeafData(leafContext: LeafContext): void {
        if (!this.data.get(leafContext.id)) {
            this.data.set(leafContext.id, {
                imageIndex: new Map(),
                indexer: undefined,
            });
            this.plugin.logger.debug(
                `Initialized data for leaf width id: ${leafContext.id}...`
            );
        }
    }

    private async cleanupLeafData(leafID: string): Promise<void> {
        const data = this.data.get(leafID);
        if (!data) {
            this.plugin.logger.error(`No data for leaf`, {
                leafID,
            });
            return;
        }

        this.data.delete(leafID);
        this.plugin.logger.debug(
            `Data for leaf with id ${leafID} was cleaned successfully.`
        );
    }

    private finalizeElementContext(
        ctx: Partial<BaseUnitContext>
    ): BaseUnitContext | undefined {
        if (
            !ctx.element ||
            !ctx.elementType ||
            !ctx.origin ||
            !ctx.mode ||
            !ctx.sourceData
        ) {
            return undefined;
        }
        return ctx as BaseUnitContext;
    }

    pushImageContext(imageData: Partial<BaseUnitContext>): void {
        if (!this.activeLeafContext) {
            return;
        }

        const elementCtx = this.finalizeElementContext(imageData);
        if (!elementCtx) {
            this.plugin.logger.warn(
                'Invalid image context data, cannot push to index.'
            );
            return;
        }

        const data = this.data.get(this.activeLeafContext.id);
        if (!data) return;

        if (!data.imageIndex.get(elementCtx.element)) {
            data.imageIndex.set(elementCtx.element, elementCtx);
            this.plugin.emitter.emit('leaf-index.image.added', elementCtx);
        }
    }

    private isExcluded(filePath: string | undefined): boolean {
        if (!filePath || this.pathsCache.length === 0) {
            return false;
        }
        return this.pathsCache.some((pattern) => {
            const trimmed = pattern.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                return false;
            }
            return this.matchPattern(trimmed, filePath);
        });
    }

    private matchPattern(pattern: string, filePath: string): boolean {
        if (pattern.endsWith('/')) {
            return (
                filePath.startsWith(pattern) || filePath.includes(`/${  pattern}`)
            );
        }

        const regexStr = pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*\*/g, '.+')
            .replace(/\*/g, '[^/]+');

        const anchored = pattern.startsWith('/');
        const regex = new RegExp(
            anchored ? `^${regexStr}$` : `(^|/)${regexStr}$`
        );

        return regex.test(filePath);
    }
}
