import electron from 'electron';
import { Component } from 'obsidian';

import { ContextMenu } from '../context-menu';
import ImageConverter from './utils/image-converter';

export class Copy extends Component {
    imageConverter: ImageConverter;
    constructor(private readonly contextMenu: ContextMenu) {
        super();

        this.imageConverter = new ImageConverter();
    }

    async copyAsPNG(img: HTMLImageElement | SVGElement): Promise<void> {
        try {
            const blob = await this.imageConverter.imgToBlob(img, 'png');
            await this.writeToBuffer(blob, 'png');
            this.contextMenu.events.unit.plugin.showNotice(
                'PNG copied to clipboard'
            );
        } catch (error) {
            this.contextMenu.events.unit.plugin.logger.error(
                'Error copying as PNG:',
                error
            );
            this.contextMenu.events.unit.plugin.showNotice(
                'Failed to copy image as PNG. Please try again.'
            );
        }
    }

    async copyAsPlain(element: SVGElement): Promise<void> {
        const code = this.imageConverter.svgToCode(element);
        const blob = new Blob([code], { type: 'text/plain' });
        await this.writeToBuffer(blob, 'plain');
        this.contextMenu.events.unit.plugin.showNotice(
            'Plain SVG copied to clipboard'
        );
    }

    async copyAsSource(): Promise<void> {
        const source = this.contextMenu.events.unit.context.sourceData.source;
        const blob = new Blob([source], { type: 'text/plain' });
        await this.writeToBuffer(blob, 'plain');
        this.contextMenu.events.unit.plugin.showNotice(
            'Source code copied to clipboard'
        );
    }

    async writeToBuffer(blob: Blob, format: 'png' | 'plain'): Promise<void> {
        if (format === 'plain') {
            const text = await blob.text();
            await navigator.clipboard.writeText(text);
            return;
        }

        // desktop — electron
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime check for Electron environment
        if (electron) {
            const { clipboard, nativeImage } = electron as {
                clipboard: {
                    writeImage: (img: unknown) => void;
                };
                nativeImage: {
                    createFromBuffer: (buf: Buffer) => unknown;
                };
            };
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const image = nativeImage.createFromBuffer(buffer);
            clipboard.writeImage(image);
            return;
        }

        // mobile — browser clipboard API
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
        ]);
    }
}
