import IzdPlugin from '@/core/izd-plugin';
import ImageConverter from '@/modes/integrated-mode/integrated-unit/events/handlers/context-menu/context-actions/utils/image-converter';
import PopupRoot from '@/modes/popup-mode/ui/PopupRoot';
import { isThisSvgIcon } from '@/utils/dom-utils';

import { Component, MarkdownRenderer, MarkdownView } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';

export default class PopupMode extends Component {
    popupDiv: HTMLDivElement | null = null;
    popupRoot: Root | null = null;
    imgConverter: ImageConverter;
    objectUrls: string[];

    constructor(readonly plugin: IzdPlugin) {
        super();
        this.imgConverter = new ImageConverter();
        this.objectUrls = [];
    }

    initialize(): void {
        this.load();

        this.plugin.app.workspace.on('layout-change', () => {
            const view =
                this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
            if (!view) {
                return;
            }
            this.addPopupButton(view);
        });
    }

    addPopupButton(view: MarkdownView): void {
        const hasButton = view.actionsEl.querySelector('.izd-popup-button');

        if (hasButton) {
            return;
        }

        const button = view.addAction(
            'layout-grid',
            'Open view image gallery in popup window',
            this.showPopupForViewImages.bind(this)
        );

        button.addClass('izd-popup-button');

        this.register(() => {
            button.remove();
        });
    }

    async getAllImagesForPopup(
        view: MarkdownView
    ): Promise<Array<HTMLImageElement | SVGElement>> {
        const component = new Component();
        component.load();

        const el = createDiv();
        el.style.visibility = 'hidden';
        document.body.appendChild(el);

        const file = view.file;
        if (!file) {
            throw new Error('View has no file');
        }

        const content = await this.plugin.app.vault.cachedRead(file);
        await MarkdownRenderer.render(
            this.plugin.app,
            content,
            el,
            file.path,
            component
        );

        await new Promise((resolve) => window.requestAnimationFrame(resolve));

        const images = Array.from(el.querySelectorAll('img,svg')).filter(
            (img) => !isThisSvgIcon(img)
        ) as Array<HTMLImageElement | SVGElement>;

        const preparedImages = Promise.all(
            images.map(async (img) => {
                if (img instanceof HTMLImageElement) {
                    return img;
                } 
                    const blob = await this.imgConverter.imgToBlob(img, 'png');
                    const url = URL.createObjectURL(blob);
                    const newImg = new Image();
                    newImg.src = url;
                    this.objectUrls.push(url);
                    return newImg;
                
            })
        );

        el.remove();
        component.unload();

        return preparedImages;
    }

    async showPopupForViewImages(): Promise<void> {
        const view =
            this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            this.plugin.showNotice('No active Markdown view found.');
            return;
        }

        const images = await this.getAllImagesForPopup(view);
        if (images.length === 0) {
            this.plugin.showNotice('No images found in the current view.');
            return;
        }
        await this.showPopup(images);
    }

    async showPopupForImage(
        image: HTMLImageElement | SVGElement
    ): Promise<void> {
        if (image instanceof HTMLImageElement) {
            await this.showPopup(image);
        } else {
            const blob = await this.imgConverter.imgToBlob(image, 'png');
            const url = URL.createObjectURL(blob);
            const newImg = new Image();
            newImg.src = url;
            this.objectUrls.push(url);
            await this.showPopup(newImg);
        }
    }

    async showPopup(
        image:
            | HTMLImageElement
            | SVGElement
            | Array<HTMLImageElement | SVGElement>
    ): Promise<void> {
        const images = Array.isArray(image) ? image : [image];
        this.plugin.logger.debug('showPopup', { count: images.length });
        this.popupDiv ??= document.body.createDiv();
        if (!this.popupRoot) {
            this.popupRoot = createRoot(this.popupDiv);
            this.popupRoot.render(
                <PopupRoot
                    popupMode={this}
                    initialImages={images}
                    onClose={() => this.closePopup()}
                />
            );
        } else {
            this.plugin.emitter.emit('image.popup.show', image);
        }
    }

    closePopup(): void {
        this.objectUrls.forEach((url) => {
            URL.revokeObjectURL(url);
        });
        this.popupRoot?.unmount();
        this.popupRoot = null;
        this.popupDiv?.remove();
        this.popupDiv = null;
    }

    onunload(): void {
        super.onunload();
        this.closePopup();
    }
}
