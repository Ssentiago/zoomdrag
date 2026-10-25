import IntegratedUnit from '../integrated-unit';
import { UnitActionOptions } from './types/interfaces';

export class UnitActions {
    constructor(public unit: IntegratedUnit) {}

    moveElement(dx: number, dy: number, options?: UnitActionOptions): void {
        const content = this.unit.context.content;
        this.unit.dx += dx;
        this.unit.dy += dy;
        content.setCssStyles({
            transition: options?.animated ? 'transform 0.3s ease-out' : 'none',
            transform: `translate(${this.unit.dx}px, ${this.unit.dy}px) scale(${this.unit.scale})`,
        });

        if (options?.animated) {
            this.unit.registerDomEvent(
                content,
                'transitionend',
                () => {
                    content.setCssStyles({
                        transition: 'none',
                    });
                },
                { once: true }
            );
        }
    }

    zoomElement(factor: number, options?: UnitActionOptions): void {
        const { content, container } = this.unit.context;

        const containerRect = container.getBoundingClientRect();
        const viewportCenterX = containerRect.left + containerRect.width / 2;
        const viewportCenterY = containerRect.top + containerRect.height / 2;

        const contentRect = content.getBoundingClientRect();
        const contentCenterX = contentRect.left + contentRect.width / 2;
        const contentCenterY = contentRect.top + contentRect.height / 2;

        const offsetX = (viewportCenterX - contentCenterX) / this.unit.scale;
        const offsetY = (viewportCenterY - contentCenterY) / this.unit.scale;

        this.unit.scale *= factor;
        this.unit.scale = Math.max(0.125, this.unit.scale);

        this.unit.dx =
            this.unit.dx - (offsetX * (factor - 1) * this.unit.scale) / factor;
        this.unit.dy =
            this.unit.dy - (offsetY * (factor - 1) * this.unit.scale) / factor;
        content.setCssStyles({
            transition: options?.animated
                ? 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
                : 'none',
            transform: `translate(${this.unit.dx}px, ${this.unit.dy}px) scale(${this.unit.scale})`,
        });

        if (options?.animated) {
            this.unit.registerDomEvent(
                content,
                'transitionend',
                () => {
                    content.setCssStyles({
                        transition: 'none',
                    });
                },
                { once: true }
            );
        }
    }
    resetZoomAndMove(options?: UnitActionOptions): void {
        this.fitToContainer(options);
    }

    fitToContainer(options?: UnitActionOptions): void {
        const { content, container } = this.unit.context;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const contentWidth = content.clientWidth;
        const contentHeight = content.clientHeight;

        this.unit.scale = Math.min(
            containerWidth / contentWidth,
            containerHeight / contentHeight,
            1
        );
        this.unit.dx = (containerWidth - contentWidth * this.unit.scale) / 2;
        this.unit.dy = (containerHeight - contentHeight * this.unit.scale) / 2;

        content.setCssStyles({
            transition: options?.animated
                ? 'transform 0.3s cubic-bezier(0.42, 0, 0.58, 1)'
                : 'none',
            transform: `translate(${this.unit.dx}px, ${this.unit.dy}px) scale(${this.unit.scale})`,
            transformOrigin: 'top left',
        });

        if (options?.animated) {
            this.unit.registerDomEvent(
                content,
                'transitionend',
                () => {
                    content.setCssStyles({
                        transition: 'none',
                    });
                },
                { once: true }
            );
        }
    }

    async toggleFullscreen(): Promise<void> {
        const container = this.unit.context.container;

        if (!document.fullscreenElement) {
            container.addClass('is-fullscreen');
            await container.requestFullscreen({ navigationUI: 'auto' });
        } else {
            container.removeClass('is-fullscreen');
            await document.exitFullscreen();
        }

        window.requestAnimationFrame(() => {
            this.resetZoomAndMove();
        });
    }
}
