import IzdPlugin from '@/core/izd-plugin';
import { BaseUnitContext } from '@/core/services/types/interfaces';
import { t } from '@/lang';
import { IntegratedModeContext } from '@/modes/integrated-mode/integrated-mode-context';
import IntegratedUnit from '@/modes/integrated-mode/integrated-unit/integrated-unit';
import { TriggerType } from '@/modes/integrated-mode/integrated-unit/types/constants';
import { LeafID } from '@/modes/integrated-mode/types/definitions';

import { Component, debounce, MarkdownView } from 'obsidian';

import { MdViewAdapter } from './adapters/md-view-adapter';
import State from './state';

export default class IntegratedMode extends Component {
    readonly context: IntegratedModeContext;
    state: State;

    constructor(public readonly plugin: IzdPlugin) {
        super();
        this.context = new IntegratedModeContext(this);
        this.state = new State(this);
    }

    initialize(): void {
        this.load();

        this.setupCommands();
        this.setupFileMenu();
        this.setupInternalEventHandlers();
        this.setupObsidianEventHandlers();
        this.setupDomSubscriptions();
    }

    async onunload(): Promise<void> {
        await this.state.clear();
    }

    private setupCommands(): void {
        this.plugin.addCommand({
            id: 'toggle-panels-state',
            name: 'Toggle control panels visibility for all the active interactive images in current note',
            checkCallback: (checking: boolean) => {
                const units = this.state.getUnits(this.context.leafID!);

                if (checking) {
                    return (
                        (this.context.inLivePreviewMode ||
                            this.context.inPreviewMode) &&
                        this.context.active &&
                        units.some((u) => u.active)
                    );
                }
                if (!this.context.active) {
                    this.plugin.showNotice(t.commands.togglePanels.notice.noMd);
                    return;
                }

                if (!units.some((d) => d.active)) {
                    this.plugin.showNotice(
                        t.commands.togglePanels.notice.noActiveImages
                    );
                    return;
                }

                const filteredU = units.filter((d) => d.active);

                const anyVisible = filteredU.some(
                    (u) => u.controlPanel.hasVisiblePanels
                );

                filteredU.forEach((u) =>
                    anyVisible
                        ? u.controlPanel.hide(TriggerType.FORCE)
                        : u.controlPanel.show(TriggerType.FORCE)
                );
                const message = anyVisible
                    ? t.commands.togglePanels.notice.hidden
                    : t.commands.togglePanels.notice.shown;
                this.plugin.showNotice(message);
                this.plugin.logger.debug(
                    'Called command `toggle-panels-management-state`'
                );
                return true;
            },
        });
    }

    private setupFileMenu(): void {
        this.registerEvent(
            this.plugin.app.workspace.on('file-menu', (menu) => {
                if (
                    !(
                        this.context.inPreviewMode ||
                        this.context.inLivePreviewMode
                    )
                )
                    return;

                const isNativeEventsEnabled = this.state.data.get(
                    this.context.leafID!
                )?.nativeTouchEventsEnabled;
                if (isNativeEventsEnabled === undefined) return;

                menu.addItem((item) => {
                    item.setIcon(
                        isNativeEventsEnabled ? 'hand' : 'circle-slash-2'
                    );
                    item.setTitle(
                        `Native touch: ${isNativeEventsEnabled ? 'ON' : 'OFF'}`
                    );

                    item.onClick(() => {
                        const data = this.state.data.get(this.context.leafID!)!;
                        data.nativeTouchEventsEnabled =
                            !data.nativeTouchEventsEnabled;
                    });
                });
            })
        );
    }

    private setupInternalEventHandlers(): void {
        this.plugin.emitter.on('unit.created', (unit: IntegratedUnit) => {
            const leafID = this.context.leafID;
            if (!leafID) {
                this.plugin.logger.warn('No active leaf found.');
                this.state.pushOrphanUnit(unit);
                this.plugin.logger.debug(
                    `'orphan unit with id ${unit.id} was added to state'`
                );
                return;
            }
            this.state.pushUnit(leafID, unit);
            this.plugin.logger.debug('Unit added to state', {
                leafID,
                unitName: unit.context.options.name,
            });
        });

        this.plugin.emitter.on('create-integrated-element', async (element) => {
            const view =
                this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
            const ctx = this.plugin.leafIndex.data
                .get(view?.leaf.id!)
                ?.imageIndex.get(element);

            if (!ctx) {
                return;
            }

            const mdAdapter = new MdViewAdapter(this, view!.file!.stat);

            await mdAdapter.initialize(ctx);
        });

        this.plugin.emitter.on(
            'create-integrated-element-outside-view',
            async (ctx: BaseUnitContext) => {
                const mdAdapter = new MdViewAdapter(this, {
                    ctime: 0,
                    size: 0,
                    mtime: 0,
                });
                await mdAdapter.initialize(ctx);
            }
        );

        this.plugin.emitter.on(
            'leaf-index.image.added',
            async (imageData: BaseUnitContext) => {
                if (this.plugin.help.isHelpOpen) return;

                const view =
                    this.plugin.app.workspace.getActiveViewOfType(MarkdownView);

                if (!view) {
                    this.plugin.logger.warn(
                        'No active Markdown view found for image data',
                        imageData
                    );
                    return;
                }

                const mdAdapter = new MdViewAdapter(this, view.file!.stat);

                this.plugin.settings.$.units.interactivity.markdown
                    .autoDetect && (await mdAdapter.initialize(imageData));
            }
        );
    }

    private setupObsidianEventHandlers(): void {
        const onLeafEvent = async (
            event: 'active-leaf-change' | 'layout-change'
        ) => {
            this.context.cleanup((leafID) => this.state.cleanupLeaf(leafID));
            this.context.initialize((leafID) => {
                this.state.initializeLeaf(leafID);
                this.setupResizeObserver(leafID);
            });

            if (!this.context.active) {
                return;
            }

            if (event === 'layout-change') {
                await this.state.cleanupUnitsOnFileChange(
                    this.context.leafID!,
                    this.context.view!.file!.stat
                );
                await this.state.cleanOrphan();
            }
        };

        this.plugin.registerEvent(
            this.plugin.app.workspace.on('layout-change', async () => {
                this.plugin.logger.debug(
                    'Calling withing the layout-change-event...'
                );

                await onLeafEvent('layout-change');

                const leafId = this.context.leafID;
                if (!leafId) {
                    return;
                }

                const images = this.plugin.leafIndex.data.get(leafId);
                if (!images) {
                    return;
                }

                const mode = this.context.inPreviewMode
                    ? 'preview'
                    : this.context.inLivePreviewMode
                      ? 'live-preview'
                      : undefined;
                if (!mode) {
                    return;
                }

                const adapter = new MdViewAdapter(
                    this,
                    this.context.view?.file?.stat!
                );
                const currentModeImages = Array.from(
                    images.imageIndex.values()
                ).filter((i) => i.mode === mode);
                for (const image of currentModeImages) {
                    await adapter.initialize(image);
                }
            })
        );
        this.plugin.registerEvent(
            this.plugin.app.workspace.on('active-leaf-change', async () => {
                this.plugin.logger.debug(
                    'Called withing the active-leaf-change event...'
                );
                await onLeafEvent('active-leaf-change');
            })
        );
    }

    private setupResizeObserver(leafID: LeafID): void {
        if (this.state.hasResizeObserver(leafID)) {
            return;
        }
        const debouncedApplyLayout = debounce(
            () => {
                this.state
                    .getUnits(leafID)
                    .forEach((unit) => unit.applyLayout());
            },
            50,
            true
        );

        const obs = new ResizeObserver((entries, observer) => {
            debouncedApplyLayout();
        });
        obs.observe(this.context.view?.contentEl!);
        this.state.setResizeObserver(leafID, obs);
    }

    private setupDomSubscriptions(): void {
        this.plugin.domWatcher.subscribe(
            (mutation) =>
                mutation.type === 'attributes' &&
                mutation.target instanceof Element &&
                (mutation.target.hasClass('markdown-source-view') ||
                    mutation.target.hasClass('markdown-preview-view')) &&
                mutation.attributeName === 'class' &&
                (!!mutation.oldValue?.contains('is-readable-line-width') ||
                    mutation.target.hasClass('is-readable-line-width')) &&
                this.context.active &&
                this.context.leaf!.containerEl.contains(mutation.target),
            (mutation) => {
                this.plugin.emitter.emit('leaf-layout-changed');
            }
        );
    }
}
