import { Component } from 'obsidian';

import { TriggerType } from '../../types/constants';
import Events from '../events';
import { Handler } from '../types/interfaces';

export class Mouse extends Component implements Handler {
    private startX!: number;
    private startY!: number;
    private initialX!: number;
    private initialY!: number;
    private isDragging = false;

    constructor(private readonly events: Events) {
        super();
    }

    initialize(): void {
        this.load();
        const { container } = this.events.unit.context;

        this.registerDomEvent(container, 'wheel', this.wheel);
        this.registerDomEvent(container, 'wheel', this.wheelScroll);

        this.registerDomEvent(container, 'mousedown', this.mouseDown);

        this.registerDomEvent(container, 'mousemove', this.mouseMove);

        this.registerDomEvent(container, 'mouseup', this.mouseUp);
        this.registerDomEvent(container, 'mouseleave', this.mouseLeave);

        this.registerDomEvent(container, 'mouseenter', this.mouseEnter);

        this.registerDomEvent(container, 'dblclick', this.dblclick);

        this.registerDomEvent(container, 'click', this.click);
    }

    get elements(): { container: HTMLElement; content: HTMLElement } {
        const container = this.events.unit.context.container;
        const content = this.events.unit.context.content;
        return { container, content };
    }

    private readonly wheel = (event: WheelEvent): void => {
        const modifierKey = event.ctrlKey || event.metaKey;
        if (
            !modifierKey &&
            activeDocument.fullscreenElement !== this.events.unit.context.content
        ) {
            return;
        }

        if (event.shiftKey || event.altKey) {
            return;
        }

        const { content } = this.elements;

        const viewportCenterX = event.clientX;
        const viewportCenterY = event.clientY;

        const contentRect = content.getBoundingClientRect();
        const contentCenterX = contentRect.left + contentRect.width / 2;
        const contentCenterY = contentRect.top + contentRect.height / 2;

        const offsetX =
            (viewportCenterX - contentCenterX) / this.events.unit.scale;
        const offsetY =
            (viewportCenterY - contentCenterY) / this.events.unit.scale;

        const prevScale = this.events.unit.scale;
        this.events.unit.scale += event.deltaY * -0.001;
        this.events.unit.scale = Math.max(0.125, this.events.unit.scale);

        const scaleDiff = this.events.unit.scale - prevScale;
        this.events.unit.dx -= offsetX * scaleDiff;
        this.events.unit.dy -= offsetY * scaleDiff;

        content.setCssStyles({
            transform: `translate(${this.events.unit.dx}px, ${this.events.unit.dy}px) scale(${this.events.unit.scale})`,
        });

        event.preventDefault();
        event.stopPropagation();
    };

    private readonly wheelScroll = (event: WheelEvent): void => {
        if (!(event.shiftKey || event.altKey)) {
            return;
        }

        const isHorizontal = event.shiftKey && !event.altKey;
        const isVertical = event.shiftKey && event.altKey;

        // Use whichever delta has the larger magnitude. On macOS, holding Shift
        // causes the browser to convert vertical scroll to horizontal, putting
        // the value in deltaX instead of deltaY.
        const delta =
            Math.abs(event.deltaX) > Math.abs(event.deltaY)
                ? event.deltaX
                : event.deltaY;

        let x = 0,
            y = 0;

        if (isHorizontal) {
            x = delta > 0 ? 20 : -20;
        }
        if (isVertical) {
            y = delta > 0 ? 20 : -20;
        }

        this.events.unit.actions.moveElement(x, y, { animated: true });

        event.preventDefault();
        event.stopPropagation();
    };

    private readonly mouseDown = (event: MouseEvent): void => {
        if (event.button !== 0) {
            return;
        }
        const { container, content } = this.elements;

        container.focus({ preventScroll: true });
        this.isDragging = true;
        this.startX = event.clientX;
        this.startY = event.clientY;

        this.initialX = this.events.unit.dx;
        this.initialY = this.events.unit.dy;
        content.setCssStyles({
            cursor: 'grabbing',
        });

        event.preventDefault();
        event.stopPropagation();
    };

    private readonly mouseMove = (event: MouseEvent): void => {
        if (!this.isDragging) {
            return;
        }
        const { content } = this.elements;

        const dx = event.clientX - this.startX;
        const dy = event.clientY - this.startY;
        this.events.unit.dx = this.initialX + dx;
        this.events.unit.dy = this.initialY + dy;
        content.setCssStyles({
            transform: `translate(${this.events.unit.dx}px, ${this.events.unit.dy}px) scale(${this.events.unit.scale})`,
        });

        event.preventDefault();
        event.stopPropagation();
    };

    private readonly mouseUp = (event: MouseEvent): void => {
        const { content } = this.elements;

        this.isDragging = false;
        content.setCssStyles({ cursor: 'grab' });

        event.preventDefault();
        event.stopPropagation();
    };

    private readonly mouseLeave = (event: MouseEvent): void => {
        this.mouseUp(event);
        this.events.unit.controlPanel.hide(TriggerType.MOUSE);

        event.preventDefault();
        event.stopPropagation();
    };

    private readonly mouseEnter = (event: MouseEvent): void => {
        this.events.unit.controlPanel.show(TriggerType.MOUSE);
        event.preventDefault();
        event.stopPropagation();
    };

    private readonly dblclick = (event: MouseEvent) => {
        if ((event.target as Element).closest('.izd-control-panel')) return;

        this.events.unit.actions.resetZoomAndMove({ animated: true });
        event.stopPropagation();
        event.preventDefault();
    };

    // to handle case when user click on links in diagrams
    private readonly click = (event: MouseEvent) => {
        const x = event.clientX;
        const y = event.clientY;

        if (!(this.startX === x && this.startY === y)) {
            event.preventDefault();
            event.stopPropagation();
        }
    };
}
