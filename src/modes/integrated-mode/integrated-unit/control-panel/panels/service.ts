import { t } from '@/lang';

import { PanelsTriggering } from '../../../../../settings/types/interfaces';
import { TriggerType } from '../../types/constants';
import { updateButton } from '../helpers/helpers';
import { IControlPanel } from '../types/interfaces';
import { BasePanel } from './base-panel';
import { ServiceButtons } from './types/constants';
import { ButtonsData } from './types/interfaces';

export class ServicePanel extends BasePanel<ServiceButtons> {
    buttons = new Map<ServiceButtons, ButtonsData>();

    constructor(controlPanel: IControlPanel) {
        super(controlPanel);
    }

    initialize(): void {
        super.initialize();
        this.setupEventListeners();
    }

    get enabled(): boolean {
        return (
            this.unit.plugin.settings.$.panels.local.panels.service.on &&
            this.unit.context.options.panels.service.on
        );
    }

    get cssClass(): string {
        return 'izd-service-panel';
    }

    get cssStyles(): object {
        return {
            ...this.unit.plugin.settings.$.panels.local.panels.service.position,
            gridTemplateColumns: 'repeat(auto-fit, minmax(24px, 1fr))',
            gridAutoFlow: 'column',
        };
    }

    getButtonsConfig(): Array<{
        id: ServiceButtons;
        title: string;
        icon: string;
        action: () => void;
    }> {
        const buttons = [];

        const serviceButtons =
            this.unit.plugin.settings.$.panels.local.panels.service.buttons;

        if (serviceButtons.hide) {
            buttons.push({
                id: ServiceButtons.Hide,
                icon: 'eye',
                action: (): void => {
                    const button = this.buttons.get(
                        ServiceButtons.Hide
                    )?.element;

                    if (!button) {
                        return;
                    }
                    const isCurrentlyHiding = button.dataset.hiding === 'true';

                    const willBeHiding = !isCurrentlyHiding;

                    button.dataset.hiding = willBeHiding.toString();

                    isCurrentlyHiding
                        ? this.controlPanel.show(TriggerType.SERVICE_HIDING)
                        : this.controlPanel.hide(TriggerType.SERVICE_HIDING);

                    updateButton(
                        button,
                        isCurrentlyHiding ? 'eye' : 'eye-off',
                        willBeHiding
                            ? t.image.controlPanel.service.hide.hidden
                            : t.image.controlPanel.service.hide.shown
                    );
                },
                title: t.image.controlPanel.service.hide.shown,
                dataAttributes: {
                    hiding: 'false',
                },
            });
        }

        if (serviceButtons.fullscreen) {
            buttons.push({
                id: ServiceButtons.Fullscreen,
                icon: 'maximize',
                action: async (): Promise<void> => {
                    const button = this.buttons.get(
                        ServiceButtons.Fullscreen
                    )?.element;

                    if (!button) {
                        return;
                    }

                    await this.unit.actions.toggleFullscreen();

                    if (
                        document.fullscreenElement ===
                        this.unit.context.container
                    ) {
                        updateButton(
                            button,
                            'maximize',
                            t.image.controlPanel.service.fullscreen.on
                        );
                    } else {
                        updateButton(
                            button,
                            'minimize',
                            t.image.controlPanel.service.fullscreen.off
                        );
                    }
                },
                title: t.image.controlPanel.service.fullscreen.on,
            });
        }
        return buttons;
    }

    setupPanelContents(): void {
        const settings = this.unit.plugin.settings;
        this.panel.toggleClass(
            'hidden',
            settings.$.panels.global.triggering.mode !==
                PanelsTriggering.ALWAYS &&
                !settings.$.panels.global.triggering.ignoreService
        );
        super.setupPanelContents();
    }

    setupEventListeners(): void {
        const fullscreenButton = this.buttons.get(
            ServiceButtons.Fullscreen
        )?.element;

        if (!fullscreenButton) {
            return;
        }

        this.registerDomEvent(
            this.unit.context.container,
            'fullscreenchange',
            this.onFullScreenChange
        );
    }

    private readonly onFullScreenChange = (): void => {
        const button = this.buttons.get(ServiceButtons.Fullscreen)?.element;

        if (!button) {
            return;
        }
        if (document.fullscreenElement) {
            window.requestAnimationFrame(() => {
                this.unit.actions.resetZoomAndMove();
            });
            updateButton(
                button,
                'minimize',
                t.image.controlPanel.service.fullscreen.on
            );
        } else {
            window.requestAnimationFrame(() => {
                this.unit.actions.resetZoomAndMove();
            });
            updateButton(
                button,
                'maximize',
                t.image.controlPanel.service.fullscreen.off
            );
        }
    };

    protected get supportedTriggers(): number {
        const base = super.supportedTriggers & ~TriggerType.SERVICE_HIDING;
        const shouldIgnoreExternalTriggers =
            this.unit.plugin.settings.$.panels.global.triggering.ignoreService;

        if (!shouldIgnoreExternalTriggers) {
            return base;
        }

        const unSupportedFlags = TriggerType.MOUSE | TriggerType.FOCUS;
        return base & ~unSupportedFlags;
    }
}
