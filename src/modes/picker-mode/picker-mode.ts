import IzdPlugin from '@/core/izd-plugin';
import { t } from '@/lang';
import {
    InteractiveInitialization,
    InteractiveMode,
} from '@/modes/integrated-mode/integrated-unit/types/constants';
import { SettingsEventPayload } from '@/settings/types/interfaces';
import { isInsideMarkdownDOM, isThisSvgIcon } from '@/utils/dom-utils';

import { Component } from 'obsidian';

export default class PickerMode extends Component {
    private isActive = false;
    private tooltip: HTMLDivElement | null = null;
    private currentElement: null | Element = null;
    private ribbonButton!: HTMLElement;

    constructor(private readonly plugin: IzdPlugin) {
        super();
    }

    initialize(): void {
        this.load();

        this.setupEvents();
        this.setupCommands();

        this.plugin.settings.$.units.interactivity.picker.enabled &&
            this.createRibbon();
    }

    private readonly pickerModeToggleHandler = (
        payload: SettingsEventPayload
    ) => {
        if (!payload.newValue) {
            this.ribbonButton.removeEventListener('click', this.toggle);
            this.ribbonButton.remove();
        } else {
            this.createRibbon();
        }
    };

    private setupEvents(): void {
        const events = this.plugin.settings.$$;
        this.plugin.emitter.on(
            events.units.interactivity.picker.enabled.$path,
            this.pickerModeToggleHandler
        );
    }

    private setupCommands(): void {
        this.plugin.addCommand({
            id: 'toggle-picker-mode',
            name: 'Toggle picker mode',
            checkCallback: (checking): boolean | undefined => {
                if (checking) {
                    return this.plugin.settings.$.units.interactivity.picker
                        .enabled;
                }

                if (
                    !this.plugin.settings.$.units.interactivity.picker.enabled
                ) {
                    this.plugin.showNotice(
                        t.commands.pickerMode.notice.disabled
                    );
                    return undefined;
                }

                this.toggle();

                return true;
            },
        });
    }

    private createRibbon(): void {
        this.ribbonButton = this.plugin.addRibbonIcon(
            'mouse-pointer-click',
            'Picker mode',
            this.toggle
        );
    }

    private readonly toggle = (_evt?: MouseEvent) => {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    };

    private createTooltip(): void {
        this.tooltip = createDiv();
        this.tooltip.addClass('picker-mode-tooltip');
        document.body.appendChild(this.tooltip);
    }

    private showTooltip(element: Element): void {
        if (!this.tooltip) return;

        const el = element.matches('svg,img')
            ? element
            : element.querySelector('svg,img');

        if (!el) return;

        const interactve = el as HTMLImageElement | SVGElement;

        const canUseIntegratedMode = isInsideMarkdownDOM(interactve);

        if (!canUseIntegratedMode) {
            this.tooltip.textContent = `Alt+Click to open popup`;
            this.tooltip.style.opacity = '1';
            return;
        }

        const initializationStatus = el.getAttribute(
            'data-interactive-initialization-status'
        ) as InteractiveInitialization;

        const mode = el.getAttribute(
            'data-interactive-mode'
        ) as InteractiveMode;

        let text = 'Make interactive';

        if (initializationStatus === InteractiveInitialization.NotInitialized) {
            text = t.pickerMode.tooltip.imageState.nonInitialized;
        } else {
            const state = mode === InteractiveMode.Interactive ? 'on' : 'off';

            text =
                state === 'on'
                    ? t.pickerMode.tooltip.imageState.on
                    : t.pickerMode.tooltip.imageState.off;
        }

        this.tooltip.textContent = text;
        this.tooltip.style.opacity = '1';
    }

    private hideTooltip(): void {
        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
        }
        this.currentElement = null;
    }

    private activate(): void {
        this.isActive = true;
        document.body.addClass('picker-mode');
        this.createTooltip();

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseover', this.onMouseOver);
        document.addEventListener('mouseout', this.onMouseOut);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('mousedown', this.onMouseDown, true);

        document.querySelectorAll('svg, img').forEach((el) => {
            if (isThisSvgIcon(el)) {
                return;
            }

            const rect = el.getBoundingClientRect();
            if (rect.width >= 64 && rect.height >= 64) {
                el.addClass('interactive-candidate');
            }
        });

        this.plugin.showNotice(t.pickerMode.tooltip.onStart, 10000);
    }

    private deactivate(): void {
        if (!this.isActive) return;

        this.isActive = false;
        document.body.removeClass('picker-mode');

        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseover', this.onMouseOver);
        document.removeEventListener('mouseout', this.onMouseOut);
        document.removeEventListener('mousedown', this.onMouseDown, true);
        document.removeEventListener('keydown', this.onKeyDown);

        document.querySelectorAll('svg, img').forEach((el) => {
            el.removeClass('interactive-candidate');
        });

        this.tooltip?.remove();
        this.tooltip = null;
        this.currentElement = null;
        this.plugin.showNotice(t.pickerMode.tooltip.onExit, 10000);
    }

    private readonly onMouseMove = (e: MouseEvent) => {
        if (!this.tooltip) return;

        // Tooltip follows a cursor with a small indent
        this.tooltip.style.left = `${e.clientX + 12}px`;
        this.tooltip.style.top = `${e.clientY - 32}px`;
    };

    private readonly onMouseOver = (e: MouseEvent) => {
        const target = e.target as Element;
        const element =
            target.closest('.cm-preview-code-block') ??
            target.closest('svg,img,.izd-container');

        if (!element) return;

        const rect = element.getBoundingClientRect();
        const isValidCandidate = rect.width >= 64 && rect.height >= 64;

        if (!isValidCandidate) {
            this.hideTooltip();
            return;
        }

        this.currentElement = element;
        this.showTooltip(element);
    };

    private readonly onMouseOut = (e: MouseEvent) => {
        const target = e.target as Element;
        const element =
            target.closest('.cm-preview-code-block') ??
            target.closest('svg,img,.izd-container');

        if (element === this.currentElement) {
            this.hideTooltip();
        }
    };

    private readonly onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.isActive) {
            this.deactivate();
        }
    };

    private readonly onMouseDown = (event: MouseEvent): void => {
        void (async () => {
            if (!(event.target instanceof Element)) return;

            event.stopPropagation();
            event.preventDefault();

            let element =
                event.target.closest('.cm-preview-code-block') ??
                event.target.closest('svg,img,.izd-container');
            if (!element) {
                this.deactivate();
                return;
            }

            element = element.matches('svg,img')
                ? element
                : element.querySelector('svg,img');

            const interactive = element as HTMLImageElement | SVGElement;

            if (event.altKey) {
                await this.plugin.popupMode.showPopup(interactive);
                this.deactivate();
                return;
            }

            const canUseIntegratedMode = isInsideMarkdownDOM(interactive);

            if (!canUseIntegratedMode) {
                return;
            }

            const wasAlreadyInitialized =
                interactive.dataset.interactiveInitializationStatus ===
                InteractiveInitialization.Initialized;

            if (wasAlreadyInitialized) {
                this.plugin.emitter.emit('toggle-integrated-element', {
                    element,
                });
                this.showTooltip(interactive);
                return;
            }

            this.plugin.emitter.emit(
                'create-integrated-element',
                interactive
            );

            this.showTooltip(interactive);
        })();
    };

    onunload(): void {
        this.deactivate();
        super.onunload();
        this.plugin.emitter.off(
            this.plugin.settings.$$.units.interactivity.picker.enabled.$path,
            this.pickerModeToggleHandler
        );
    }
}
