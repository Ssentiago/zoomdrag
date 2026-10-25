import { Component } from 'obsidian';

import { PanelsTriggering } from '../../../../../settings/types/interfaces';
import IntegratedUnit from '../../integrated-unit';
import { TriggerType } from '../../types/constants';
import { updateButton } from '../helpers/helpers';
import { IControlPanel } from '../types/interfaces';
import { ButtonsData } from './types/interfaces';

export abstract class BasePanel<TButtonKey extends string> extends Component {
    protected panel!: HTMLElement;
    protected buttons!: Map<TButtonKey, ButtonsData>;

    protected constructor(protected controlPanel: IControlPanel) {
        super();
    }

    abstract get enabled(): boolean;

    protected abstract get cssClass(): string;
    protected abstract get cssStyles(): object;

    protected abstract getButtonsConfig(): Array<{
        id: TButtonKey;
        title: string;
        icon: string;
        action: () => void;
        dataAttributes?: {
            [key: string]: string;
        };
        gridArea?: string;
    }>;

    protected setupPanelContents(): void {
        const buttonsConfigs = this.getButtonsConfig();

        buttonsConfigs.forEach((config) => {
            const button = this.createButton(
                config.icon,
                config.action,
                config.title,
                config.id,
                config.gridArea
            );

            this.buttons.set(config.id, {
                element: button,
                listener: config.action,
            });

            if (config.dataAttributes) {
                Object.entries(config.dataAttributes).forEach(
                    ([key, value]) => {
                        button.setAttribute(key, value);
                    }
                );
            }

            this.panel.appendChild(button);
        });
    }

    get unit(): IntegratedUnit {
        return this.controlPanel.unit;
    }

    initialize(): void {
        if (!this.enabled) {
            return;
        }

        const specialPanels = ['izd-fold-panel', 'izd-tip-panel'];

        if (
            !this.controlPanel.canRender &&
            !specialPanels.includes(this.cssClass)
        ) {
            return;
        }

        this.panel = this.createPanelElement();
        this.setupPanelContents();

        this.visibilityInitialization();
    }

    protected createPanelElement(): HTMLElement {
        const controlPanel = this.controlPanel.controlPanel;
        const panel = controlPanel.createDiv();
        panel.addClass(this.cssClass);
        panel.addClass('izd-panel');
        panel.addClass('visible');
        panel.setCssStyles(this.cssStyles);
        return panel;
    }

    protected createButton(
        icon: string,
        action: () => void,
        title: string,
        id: string,
        gridArea?: string
    ): HTMLButtonElement {
        const button = createEl('button');
        button.id = id;

        button.setCssStyles({
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '3px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'background-color 0.2s ease',
            gridArea: gridArea ?? 'unset',
        });

        updateButton(button, icon, title);

        this.registerDomEvent(button, 'click', action);

        this.registerDomEvent(button, 'mouseenter', () => {
            button.setCssStyles({
                color: 'var(--interactive-accent)',
            });
        });

        this.registerDomEvent(button, 'mouseleave', () => {
            button.setCssStyles({
                color: 'var(--text-muted)',
            });
        });

        return button;
    }

    visibilityInitialization(): void {
        const triggeringMode =
            this.controlPanel.unit.plugin.settings.$.panels.global.triggering
                .mode;

        const isFolded =
            this.controlPanel.unit.context.container.dataset.folded === 'true';

        let trigger = TriggerType.NONE;

        if (isFolded) {
            trigger |= TriggerType.FOLD;
        }
        if (triggeringMode === PanelsTriggering.FOCUS) {
            trigger |= TriggerType.FOCUS;
        }
        if (triggeringMode === PanelsTriggering.HOVER) {
            trigger |= TriggerType.MOUSE;
        }

        this.hide(trigger);
    }

    show(triggerType: TriggerType): void {
        if (!this.shouldRespondToTrigger(triggerType)) {
            return;
        }

        this.panel.removeClass('hidden');
        this.panel.addClass('visible');
    }

    hide(triggerType: TriggerType): void {
        if (!this.shouldRespondToTrigger(triggerType)) {
            return;
        }

        this.panel.removeClass('visible');
        this.panel.addClass('hidden');
    }

    isVisible(): boolean {
        return (
            this.panel.classList.contains('visible') &&
            !this.panel.classList.contains('hidden')
        );
    }

    protected shouldRespondToTrigger(triggerType: TriggerType): boolean {
        if (triggerType === TriggerType.FORCE) {
            return true;
        }
        return !!(this.supportedTriggers & triggerType);
    }

    protected get supportedTriggers(): number {
        const triggeringOptions =
            this.unit.plugin.settings.$.panels.global.triggering;

        let base =
            TriggerType.FORCE | TriggerType.FOLD | TriggerType.SERVICE_HIDING;

        if (triggeringOptions.mode === PanelsTriggering.HOVER) {
            base = base | TriggerType.MOUSE;
        }

        if (triggeringOptions.mode === PanelsTriggering.FOCUS) {
            base = base | TriggerType.FOCUS;
        }

        // in that way we can add support to mouse (focus) triggering. or for keypress

        return base;
    }

    onunload(): void {
        super.onunload();
    }
}
