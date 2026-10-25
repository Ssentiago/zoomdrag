import { t } from '@/lang';

import { PanelsTriggering } from '../../../../../settings/types/interfaces';
import { IControlPanel } from '../types/interfaces';
import { BasePanel } from './base-panel';
import { MoveButtons } from './types/constants';
import { ButtonsData } from './types/interfaces';

export class MovePanel extends BasePanel<MoveButtons> {
    buttons = new Map<MoveButtons, ButtonsData>();

    constructor(controlPanel: IControlPanel) {
        super(controlPanel);
    }

    get enabled(): boolean {
        return (
            this.unit.plugin.settings.$.panels.local.panels.move.on &&
            this.unit.context.options.panels.move.on
        );
    }

    get cssClass(): string {
        return 'izd-move-panel';
    }

    get cssStyles(): object {
        return {
            ...this.unit.plugin.settings.$.panels.local.panels.move.position,
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
        };
    }

    getButtonsConfig(): {
        id: MoveButtons;
        icon: string;
        action: () => void;
        title: string;
        gridArea: string;
    }[] {
        const moveButtons =
            this.unit.plugin.settings.$.panels.local.panels.move.buttons;

        const buttons = [
            {
                id: MoveButtons.UpLeft,
                icon: 'arrow-up-left',
                title: t.image.controlPanel.move.upLeft,
                gridArea: '1 / 1',
                x: 50,
                y: 50,
            },
            {
                id: MoveButtons.Up,
                icon: 'arrow-up',
                title: t.image.controlPanel.move.up,
                gridArea: '1 / 2',
                x: 0,
                y: 50,
            },
            {
                id: MoveButtons.UpRight,
                icon: 'arrow-up-right',
                title: t.image.controlPanel.move.upRight,
                gridArea: '1 / 3',
                x: -50,
                y: 50,
            },
            {
                id: MoveButtons.Left,
                icon: 'arrow-left',
                title: t.image.controlPanel.move.upLeft,
                gridArea: '2 / 1',
                x: 50,
                y: 0,
            },
            {
                id: MoveButtons.Right,
                icon: 'arrow-right',
                title: t.image.controlPanel.move.right,
                gridArea: '2 / 3',
                x: -50,
                y: 0,
            },
            {
                id: MoveButtons.DownLeft,
                icon: 'arrow-down-left',
                title: t.image.controlPanel.move.downLeft,
                gridArea: '3 / 1',
                x: 50,
                y: -50,
            },
            {
                id: MoveButtons.Down,
                icon: 'arrow-down',
                title: t.image.controlPanel.move.down,
                gridArea: '3 / 2',
                x: 0,
                y: -50,
            },
            {
                id: MoveButtons.DownRight,
                icon: 'arrow-down-right',
                title: t.image.controlPanel.move.downRight,
                gridArea: '3 / 3',
                x: -50,
                y: -50,
            },
        ];

        return buttons
            .filter((config) => moveButtons[config.id])
            .map((config) => ({
                id: config.id,
                icon: config.icon,
                action: () =>
                    this.unit.actions.moveElement(config.x, config.y, {
                        animated: true,
                    }),
                title: config.title,
                gridArea: config.gridArea,
            }));
    }

    setupPanelContents(): void {
        super.setupPanelContents();
        this.panel.toggleClass(
            'hidden',
            this.unit.plugin.settings.$.panels.global.triggering.mode !==
                PanelsTriggering.ALWAYS
        );
    }
}
