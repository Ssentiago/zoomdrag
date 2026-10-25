import { IntegratedAdapters } from '@/modes/integrated-mode/adapters/types/constants';

import { Component } from 'obsidian';

import IntegratedUnit from './integrated-unit';
import { InteractiveMode } from './types/constants';

export default class IntegratedUnitStateManager extends Component {
    constructor(private readonly unit: IntegratedUnit) {
        super();
        this.load();
    }

    async initialize(): Promise<void> {
        this.unit.plugin.emitter.on(
            'toggle-integrated-element',
            this.onToggleElement
        );
        await this.scheduleActivationIfNeeded();
    }

    private async scheduleActivationIfNeeded(): Promise<void> {
        if (this.unit.context.adapter === IntegratedAdapters.PickerMode) {
            await this.activate();
            return;
        }

        const settings = this.unit.plugin.settings;
        if (!settings.$.units.interactivity.markdown.autoDetect) {
            return;
        }
        await this.activate(true);
    }

    onToggleElement = (data: { element: Element }): void => {
        if (data.element === this.unit.context.element) {
            void (async () => {
                this.unit.active
                    ? await this.deactivate()
                    : await this.activate();
            })();
        }
    };

    activate = async (noAnimation?: boolean): Promise<void> => {
        if (this.unit.active) {
            return;
        }

        this.unit.context.element.setAttribute(
            'data-interactive-mode',
            InteractiveMode.Interactive
        );

        if (noAnimation) {
            await this.switchToInteractive();
            this.unit.initialize();
        } else {
            await this.smoothTransition(
                this.unit.context.originalParent,
                async () => {
                    await this.switchToInteractive();
                    this.unit.initialize();
                }
            );
        }

        this.unit.context.originalParent.style.removeProperty('transition');
        this.unit.context.originalParent.style.removeProperty('transform');
    };

    deactivate = async (): Promise<void> => {
        if (!this.unit.active) {
            return;
        }
        this.unit.context.element.setAttribute(
            'data-interactive-mode',
            InteractiveMode.NonInteractive
        );

        await this.smoothTransition(
            this.unit.context.originalParent,
            async () => {
                this.unit.unload();
                this.unit.controlPanel.controlPanel.remove();
                await this.switchToNonInteractive();
            }
        );
        this.unit.context.originalParent.style.removeProperty('transition');
        this.unit.context.originalParent.style.removeProperty('transform');
    };

    private async smoothTransition(
        element: HTMLElement,
        callback: () => Promise<void>
    ): Promise<Animation> {
        const transition = element.animate(
            [
                { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
                { opacity: '0', transform: 'scale(0.96)', filter: 'blur(1px)' },
            ],
            { duration: 150, fill: 'forwards' }
        );

        await transition.finished;
        await callback();

        return element.animate(
            [
                { opacity: '0', transform: 'scale(0.96)', filter: 'blur(1px)' },
                { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
            ],
            { duration: 200, easing: 'ease-out', fill: 'forwards' }
        ).finished;
    }

    async switchToInteractive(): Promise<void> {
        this.unit.active = true;

        this.unit.plugin.logger.debug(
            `Switch unit with id ${this.unit.id} to interactive state`
        );

        const { content, container, element, originalParent } =
            this.unit.context;

        this.unit.context.content.setCssStyles({
            transform: `translate(${this.unit.dx}px, ${this.unit.dy}px) scale(${this.unit.scale})`,
        });

        // SVG elements in the case of Obsidian are often generated on the go
        // For example, Mermaid
        // And they have their own styles that they apply to images based on classes
        if (this.unit.context.element instanceof SVGElement) {
            const originalParentClasses = originalParent.className.trim();
            originalParentClasses &&
                content.addClasses(originalParentClasses.split(/\s+/));
            content.removeClass('live-preview-parent');
            originalParent.className = '';
        }

        this.unit.context.adapter === IntegratedAdapters.LivePreview &&
            this.unit.context.livePreviewWidget?.addClass(
                'live-preview-parent'
            );
        if (this.unit.context.livePreviewWidget) {
            this.unit.registerDomEvent(
                this.unit.context.livePreviewWidget,
                'click',
                (e) => {
                    if (!(e.target instanceof Element)) return;

                    if (
                        e.target.closest('.izd-control-panel') ||
                        this.unit.context.element.contains(e.target) ||
                        !this.unit.context.container.contains(e.target)
                    )
                        return;

                    e.preventDefault();
                    e.stopPropagation();
                },
                true
            );
        }
        if (!originalParent.contains(element)) {
            this.unit.plugin.logger.warn(
                'Error with replace child. It seems that active leaf was changed?'
            );
        } else {
            originalParent.replaceChild(container, element);
        }
        container.appendChild(content);
        content.appendChild(element);

        await this.waitForElementsLayout([element, content, container]);
    }

    private async switchToNonInteractive(): Promise<void> {
        this.unit.active = false;

        this.unit.plugin.logger.debug(
            `Switch unit with id ${this.unit.id} to non-interactive state`
        );

        const { content, container, element, originalParent } =
            this.unit.context;

        if (this.unit.context.element instanceof SVGElement) {
            originalParent.className = content.className;
            originalParent.removeClass('izd-content');
        }

        if (this.unit.context.adapter === IntegratedAdapters.LivePreview) {
            const lPreviewWidget = this.unit.context.livePreviewWidget;
            lPreviewWidget.removeClass('live-preview-parent');
            lPreviewWidget.style.removeProperty('height');
            lPreviewWidget.style.removeProperty('width');
        }

        if (!originalParent.contains(container)) {
            this.unit.plugin.logger.warn(
                'Error with replace child. It seems that active leaf was changed?'
            );
        } else {
            originalParent.replaceChild(element, container);
        }
        container.remove();
        content.remove();

        await new Promise((resolve) => window.requestAnimationFrame(resolve));
    }

    private waitForElementsLayout(elements: Element[]): Promise<void> {
        return new Promise((resolve) => {
            const checkLayout = () => {
                if (!this._loaded) {
                    resolve();
                    return;
                }

                const allReady = elements.every((el) => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                });

                if (!allReady) {
                    window.requestAnimationFrame(checkLayout);
                    return;
                }

                const elementRect = elements[0].getBoundingClientRect();
                if (this.unit.context.size.width === 0) {
                    this.unit.context.size.width = elementRect.width;
                }
                if (this.unit.context.size.height === 0) {
                    this.unit.context.size.height = elementRect.height;
                }
                resolve();
            };

            window.requestAnimationFrame(checkLayout);
        });
    }

    onunload(): void {
        super.onunload();
        this.unit.plugin.emitter.off(
            'toggle-integrated-element',
            this.onToggleElement
        );

        this.unit.context.element.removeAttribute(
            'data-interactive-initialization-status'
        );
        this.unit.context.element.removeAttribute('data-interactive-mode');
    }
}
