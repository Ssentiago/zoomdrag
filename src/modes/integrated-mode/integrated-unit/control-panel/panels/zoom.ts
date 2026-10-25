import { t } from '@/lang';

import { PanelsTriggering } from '../../../../../settings/types/interfaces';
import { IControlPanel } from '../types/interfaces';
import { BasePanel } from './base-panel';
import { ZoomButtons } from './types/constants';
import { ButtonsData } from './types/interfaces';

export class ZoomPanel extends BasePanel<ZoomButtons> {
    buttons = new Map<ZoomButtons, ButtonsData>();

    constructor(controlPanel: IControlPanel) {
        super(controlPanel);
    }

    get enabled(): boolean {
        return (
            this.controlPanel.unit.plugin.settings.$.panels.local.panels.zoom
                .on && this.controlPanel.unit.context.options.panels.zoom.on
        );
    }

    get cssClass(): string {
        return 'izd-zoom-panel';
    }

    get cssStyles(): object {
        return {
            ...this.controlPanel.unit.plugin.settings.$.panels.local.panels.zoom
                .position,
            transform: 'translateY(-50%)',
            gridTemplateColumns: '1fr',
        };
    }

    getButtonsConfig(): {
        id: ZoomButtons;
        icon: string;
        action: () => void;
        title: string;
    }[] {
        const zoomButtons =
            this.controlPanel.unit.plugin.settings.$.panels.local.panels.zoom
                .buttons;

        const buttons = [];

        if (zoomButtons.in) {
            buttons.push({
                id: ZoomButtons.In,
                icon: 'zoom-in',
                action: (): void =>
                    this.controlPanel.unit.actions.zoomElement(1.1, {
                        animated: true,
                    }),
                title: t.image.controlPanel.zoom.in,
            });
        }
        if (zoomButtons.reset) {
            buttons.push({
                id: ZoomButtons.Reset,
                icon: 'refresh-cw',
                action: (): void =>
                    this.controlPanel.unit.actions.resetZoomAndMove({
                        animated: true,
                    }),
                title: t.image.controlPanel.zoom.reset,
            });
        }
        if (zoomButtons.out) {
            buttons.push({
                id: ZoomButtons.Out,
                icon: 'zoom-out',
                action: (): void =>
                    this.controlPanel.unit.actions.zoomElement(0.9, {
                        animated: true,
                    }),
                title: t.image.controlPanel.zoom.out,
            });
        }

        return buttons;
    }

    setupPanelContents(): void {
        this.panel.toggleClass(
            'hidden',
            this.controlPanel.unit.plugin.settings.$.panels.global.triggering
                .mode !== PanelsTriggering.ALWAYS
        );

        super.setupPanelContents();
    }
}
