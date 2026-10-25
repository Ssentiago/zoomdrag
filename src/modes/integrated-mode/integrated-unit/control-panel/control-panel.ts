import { FoldPanel } from '@/modes/integrated-mode/integrated-unit/control-panel/panels/fold';
import { MovePanel } from '@/modes/integrated-mode/integrated-unit/control-panel/panels/move';
import { ServicePanel } from '@/modes/integrated-mode/integrated-unit/control-panel/panels/service';
import TipPanel from '@/modes/integrated-mode/integrated-unit/control-panel/panels/tip';
import { ZoomPanel } from '@/modes/integrated-mode/integrated-unit/control-panel/panels/zoom';
import { IControlPanel } from '@/modes/integrated-mode/integrated-unit/control-panel/types/interfaces';
import { TriggerType } from '@/modes/integrated-mode/integrated-unit/types/constants';

import { Component } from 'obsidian';

import IntegratedUnit from '../integrated-unit';

export class ControlPanel extends Component implements IControlPanel {
    private static readonly BUTTON_SIZE = 34; // size 30 px plus padding 4 px
    private static readonly MIN_BUTTONS_HEIGHT = 7; // move(3) + zoom(3) + service(1)
    private static readonly MIN_BUTTONS_WIDTH = 4; // move+service(3) + fold(1)

    fold!: FoldPanel;
    move!: MovePanel;
    zoom!: ZoomPanel;
    service!: ServicePanel;
    tip!: TipPanel;

    controlPanel!: HTMLElement;

    constructor(public unit: IntegratedUnit) {
        super();
    }

    initialize(): void {
        this.load();

        this.controlPanel = this.unit.context.container.createDiv();
        this.controlPanel.addClass('izd-control-panel');

        this.move = new MovePanel(this);
        this.zoom = new ZoomPanel(this);
        this.fold = new FoldPanel(this);
        this.service = new ServicePanel(this);
        this.tip = new TipPanel(this);

        this.panels.forEach((panel) => {
            this.addChild(panel);
            panel.initialize();
        });

        this.unit.context.container.appendChild(this.controlPanel);
    }

    get canRender(): boolean {
        const { width, height } = this.unit.realSize;

        return (
            height >=
                ControlPanel.BUTTON_SIZE * ControlPanel.MIN_BUTTONS_HEIGHT &&
            width >= ControlPanel.BUTTON_SIZE * ControlPanel.MIN_BUTTONS_WIDTH
        );
    }

    private get panels() {
        return [this.move, this.zoom, this.fold, this.service, this.tip];
    }

    show(triggerType: TriggerType = TriggerType.FORCE): void {
        if (!this.canRender) {
            return;
        }
        this.panels.forEach((panel) => panel.show(triggerType));
    }

    hide(triggerType: TriggerType = TriggerType.FORCE): void {
        if (!this.canRender) {
            return;
        }
        this.panels.forEach((panel) => panel.hide(triggerType));
    }

    get hasVisiblePanels(): boolean {
        return this.panels.some((panel) => panel.isVisible());
    }

    onunload(): void {
        super.onunload();
        this.controlPanel.remove();
    }
}
