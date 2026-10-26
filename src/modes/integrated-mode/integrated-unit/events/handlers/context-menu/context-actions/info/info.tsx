import { Component } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';

import { ContextMenu } from '../../context-menu';
import InfoModal from './modals/info-modal';
import { UnitInfo } from './types/interfaces';

export default class Info extends Component {
    modalDiv: HTMLDivElement | undefined;
    reactRoot: Root | undefined;

    constructor(private readonly contextMenu: ContextMenu) {
        super();
    }

    showInfo(): void {
        const info = this.info;

        this.modalDiv ??= createDiv();
        activeDocument.body.appendChild(this.modalDiv);

        if (!this.reactRoot) {
            this.reactRoot = createRoot(this.modalDiv);
            this.reactRoot.render(
                <InfoModal
                    info={info}
                    onClose={this.closeModal}
                />
            );
        }
    }

    closeModal = (): void => {
        this.reactRoot?.unmount();
        this.reactRoot = undefined;
        this.modalDiv?.remove();
        this.modalDiv = undefined;
    };

    private get info() {
        const unit = this.contextMenu.events.unit;
        const element = unit.context.element;
        const dSize = unit.context.size;
        const sourceData = unit.context.sourceData;
        const config = unit.context.options;

        const info: UnitInfo = {
            name: config.name,
            selector: config.selector,
            enabled: config.on,
            dimensions: {
                width: dSize.width,
                height: dSize.height,
            },
            sourceLocation: {
                lineStart: sourceData.lineStart,
                lineEnd: sourceData.lineEnd,
                linesCount: sourceData.lineEnd - sourceData.lineStart + 1,
            },
            panels: Object.entries(config.panels).map(([name, panel]) => ({
                name,
                enabled: panel.on,
            })),
            elementType: element.tagName.toLowerCase(),
        };

        return info;
    }

    onunload(): void {
        super.onunload();
        this.closeModal();
    }
}
