import { Component } from 'obsidian';
import { Node } from 'ts-morph';

import Events from '../events';
import { Handler } from '../types/interfaces';

export class Touch extends Component implements Handler {
    private startX!: number;
    private startY!: number;
    private initialDistance!: number;
    private isDragging = false;
    private isPinching = false;

    private tapTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(private readonly events: Events) {
        super();
    }

    initialize(): void {
        this.load();
        const { container } = this.events.unit.context;

        this.registerDomEvent(container, 'touchstart', this.touchStart, {
            passive: false,
        });
        this.registerDomEvent(container, 'touchmove', this.touchMove, {
            passive: false,
        });
        this.registerDomEvent(container, 'touchend', this.touchEnd, {
            passive: false,
        });
    }

    private readonly touchStart = (e: TouchEvent): void => {
        if (
            this.events.unit.plugin.integratedMode.context
                .nativeTouchEventsEnabled
        ) {
            return;
        }

        const target = e.target as HTMLElement;

        // we got touch to a button panel - returning
        if (target.closest('.izd-panel')) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();

        if (e.touches.length === 1) {
            this.isDragging = true;
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;

            if (this.tapTimeout) {
                clearTimeout(this.tapTimeout);
                this.tapTimeout = null;
                this.events.unit.actions.resetZoomAndMove({ animated: true });
            } else {
                this.tapTimeout = setTimeout(() => {
                    this.tapTimeout = null;
                }, 300);
            }
        } else if (e.touches.length === 2) {
            this.isDragging = false;
            this.isPinching = true;
            this.initialDistance = this.calculateDistance(e.touches);

            if (this.tapTimeout) {
                clearTimeout(this.tapTimeout);
                this.tapTimeout = null;
            }
        }
    };

    private readonly touchMove = (e: TouchEvent): void => {
        if (
            this.events.unit.plugin.integratedMode.context
                .nativeTouchEventsEnabled
        ) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const content = this.events.unit.context.content;

        if (!content) {
            return;
        }

        if (this.isDragging && e.touches.length === 1) {
            const dx = e.touches[0].clientX - this.startX;
            const dy = e.touches[0].clientY - this.startY;

            this.events.unit.actions.moveElement(dx, dy);

            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        } else if (this.isPinching && e.touches.length === 2) {
            const currentDistance = this.calculateDistance(e.touches);
            const factor = currentDistance / this.initialDistance;

            this.events.unit.actions.zoomElement(factor);

            this.initialDistance = currentDistance;
        }
    };

    /**
     * Handles the `touchend` event on the given container element.
     *
     * If native touch event handling is enabled, this function does nothing.
     *
     * Otherwise, this function prevents the default behavior of the event
     * and stops the event from propagating. It updates the active container
     * to the given container. It also resets the `isDragging` and `isPinching`
     * flags to false.
     *
     * @param container - The container element that received the touch event.
     * @param e - The `TouchEvent` object that represents the touch event.
     */
    private readonly touchEnd = (e: TouchEvent): void => {
        if (
            this.events.unit.plugin.integratedMode.context
                .nativeTouchEventsEnabled
        ) {
            return;
        }

        const container = this.events.unit.context.container;

        const target = e.target as HTMLElement;

        // we got touch to a button panel - returning
        if (target.closest('.izd-panel')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        this.isDragging = false;
        this.isPinching = false;
        this.initialDistance = 0;
    };

    /**
     * Calculates the distance between the two touch points.
     *
     * @param touches - The two touch points.
     * @returns The distance between the two touch points.
     */
    private calculateDistance(touches: TouchList): number {
        const [touch1, touch2] = [touches[0], touches[1]];
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
