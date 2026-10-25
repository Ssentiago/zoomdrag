import { Component, debounce } from 'obsidian';

import IzdPlugin from '../../../core/izd-plugin';
import { UnitActions } from './actions/unit-actions';
import { ControlPanel } from './control-panel/control-panel';
import Events from './events/events';
import IntegratedUnitStateManager from './integrated-unit-state-manager';
import {
    FileStats,
    UnitContext,
    UnitSize,
} from './types/interfaces';

export default class IntegratedUnit extends Component {
    id!: string;
    dx = 0;
    dy = 0;
    scale = 1;
    context!: UnitContext;
    fileStats!: FileStats;
    active = false;

    actions!: UnitActions;
    controlPanel!: ControlPanel;
    events!: Events;
    interactiveStateManager!: IntegratedUnitStateManager;
    plugin!: IzdPlugin;

    constructor(plugin: IzdPlugin, context: UnitContext, fileStats: FileStats) {
        super();
        this.id = crypto.randomUUID();

        this.plugin = plugin;
        this.context = context;
        this.fileStats = fileStats;
        this.interactiveStateManager = new IntegratedUnitStateManager(this);

        this.actions = new UnitActions(this);
        this.controlPanel = new ControlPanel(this);
        this.events = new Events(this);

        this.addChild(this.events);
        this.addChild(this.controlPanel);
    }

    async setup(): Promise<void> {
        await this.interactiveStateManager.initialize();
    }
    initialize(): void {
        this.plugin.logger.debug(`Initialize unit with id ${this.id}`);

        this.load();
        this.setupEvents();

        this.events.initialize();
        this.controlPanel.initialize();

        this.applyLayout();

        this.plugin.logger.debug('Unit initialized successfully', {
            id: this.id,
        });
    }

    get realSize(): UnitSize {
        const normalizeOriginalSize = () => {
            const originalSize = this.context.size;
            const availableSize =
                this.plugin.integratedMode.context.getAvailableSize();

            const isZeroSize =
                availableSize.width === 0 || availableSize.height === 0;

            const width = isZeroSize
                ? originalSize.width
                : Math.min(originalSize.width, availableSize.width);
            const height = isZeroSize
                ? originalSize.height
                : Math.min(originalSize.height, availableSize.height);

            return { width, height };
        };

        const settingsSizeData = this.plugin.settings.$.units.size;
        const isFolded = this.context.container.dataset.folded === 'true';
        const setting = isFolded
            ? settingsSizeData.folded
            : settingsSizeData.expanded;

        const normalizedOriginalSize = normalizeOriginalSize();

        const widthInPx =
            setting.width.type === '%'
                ? (setting.width.value / 100) * normalizedOriginalSize.width
                : setting.width.value;
        const heightInPx =
            setting.height.type === '%'
                ? (setting.height.value / 100) * normalizedOriginalSize.height
                : setting.height.value;

        return {
            width: widthInPx,
            height: heightInPx,
        };
    }

    applyLayout(): void {
        this.applyRealSize();
        this.actions.fitToContainer({ animated: false });
    }

    applyRealSize(): void {
        const realSize = this.realSize;

        this.context.container.style.height = `${realSize.height}px`;
        this.context.container.style.width = `${realSize.width}px`;

        if (this.plugin.integratedMode.context.inLivePreviewMode) {
            const parent = this.context.livePreviewWidget;
            if (!parent) {
                this.plugin.logger.error(
                    'No parent found in live-preview mode'
                );
                return;
            }

            parent.style.setProperty(
                'height',
                `${realSize.height}px`,
                'important'
            );
            parent.style.setProperty(
                'width',
                `${realSize.width}px`,
                'important'
            );
        }
    }

    async onDelete(): Promise<void> {
        await this.interactiveStateManager.deactivate();

        this.interactiveStateManager.unload();
    }

    onunload(): void {
        super.onunload();
        this.plugin.logger.debug(
            `Called unload for interactive element with id ${this.id}`
        );
    }

    private setupEvents(): void {
        const debouncedApplyLayout = debounce(
            this.applyLayout.bind(this),
            300,
            true
        );

        this.plugin.emitter.on(
            this.plugin.settings.$$.units.size.$all,
            debouncedApplyLayout
        );

        this.register(() =>
            this.plugin.emitter.off(
                this.plugin.settings.$$.units.size.$all,
                debouncedApplyLayout
            )
        );

        this.plugin.emitter.on('leaf-layout-changed', debouncedApplyLayout);

        this.register(() =>
            this.plugin.emitter.off('leaf-layout-changed', debouncedApplyLayout)
        );
    }
}
