import { Component, Menu, requestUrl } from 'obsidian';

import { moment } from '@/utils/moment';

import { ContextMenu } from '../context-menu';
import ImageConverter from './utils/image-converter';

export class Export extends Component {
    imageConverter: ImageConverter;
    constructor(private readonly contextMenu: ContextMenu) {
        super();

        this.imageConverter = new ImageConverter();
    }

    async exportAsPNG(img: HTMLImageElement | SVGElement): Promise<void> {
        try {
            const blob = await this.imageConverter.imgToBlob(img, 'png');
            this.downloadFile(blob, 'png');
        } catch (error) {
            this.contextMenu.events.unit.plugin.logger.error(
                'Error exporting as PNG:',
                error
            );
            this.contextMenu.events.unit.plugin.showNotice(
                'Failed to export image as PNG. Please try again.'
            );
        }
    }

    async exportAsJPG(img: HTMLImageElement | SVGElement): Promise<void> {
        try {
            const blob = await this.imageConverter.imgToBlob(img, 'jpg');
            this.downloadFile(blob, 'jpg');
        } catch (error) {
            this.contextMenu.events.unit.plugin.logger.error(
                'Error exporting as JPG:',
                error
            );
            this.contextMenu.events.unit.plugin.showNotice(
                'Failed to export image as JPG. Please try again.'
            );
        }
    }

    async exportAsSVG(svg: SVGElement): Promise<void> {
        try {
            const blob = await this.imageConverter.imgToBlob(svg, 'svg');
            this.downloadFile(blob, 'svg');
        } catch (error) {
            this.contextMenu.events.unit.plugin.logger.error(
                'Error exporting as SVG:',
                error
            );
            this.contextMenu.events.unit.plugin.showNotice(
                'Failed to export SVG. Please try again.'
            );
        }
    }

    private downloadFile(blob: Blob, extension: string): void {
        const { unit } = this.contextMenu.events;
        const filename = `export_${unit.plugin.integratedMode.context.view?.file?.basename ?? 'unit'}}_${moment().format('YYYYMMDDHHmmss')}.${extension}`;
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    }
}
