import { requestUrl } from 'obsidian';

export default class ImageConverter {
    async imgToBlob(
        img: HTMLImageElement | SVGElement,
        format: 'png' | 'jpg' | 'svg'
    ): Promise<Blob> {
        let blob: Blob;
        const normalizedFormat = format === 'png' ? 'png' : 'jpeg';

        if (img instanceof SVGElement) {
            blob = await this.svgToRasterWithStyles(img, normalizedFormat);
        } else {
            try {
                blob = await this.fetchImg(img, normalizedFormat);
            } catch {
                blob = await this.drawLocalImage(img, normalizedFormat);
            }
        }

        return blob;
    }

    svgToCode(element: SVGElement): string {
        if (element.instanceOf(SVGElement)) {
            return new XMLSerializer().serializeToString(element);
        }
        return '';
    }

    async fetchImg(
        img: HTMLImageElement,
        format: 'png' | 'jpeg'
    ): Promise<Blob> {
        const response = await requestUrl(img.src);
        return new Blob([response.arrayBuffer], { type: `image/${format}` });
    }

    async drawLocalImage(
        img: HTMLImageElement,
        format: 'png' | 'jpeg'
    ): Promise<Blob> {
        const canvas = createEl('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get 2d context');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('toBlob returned null'));
                },
                `image/${format}`
            );
        });
    }

    private async svgToRasterWithStyles(
        svg: SVGElement,
        format: 'png' | 'jpeg'
    ): Promise<Blob> {
        const clone = svg.cloneNode(true) as SVGElement;

        this.inlineComputedStyles(svg, clone);

        const rect = svg.getBoundingClientRect();
        clone.setAttribute('width', String(rect.width));
        clone.setAttribute('height', String(rect.height));

        const bgColor = getComputedStyle(document.body).backgroundColor;

        const svgData = new XMLSerializer().serializeToString(clone);
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        const canvas = createEl('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get 2d context');

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0);

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('toBlob returned null'));
                    return;
                }
                resolve(blob);
            }, `image/${format}`);
        });
    }

    private inlineComputedStyles(source: Element, target: Element): void {
        const computed = getComputedStyle(source);
        const el = target as SVGElement;

        for (let i = 0; i < computed.length; i++) {
            const prop = computed[i];
            el.style.setProperty(prop, computed.getPropertyValue(prop));
        }

        const sourceChildren = source.children;
        const targetChildren = target.children;
        for (let i = 0; i < sourceChildren.length; i++) {
            this.inlineComputedStyles(sourceChildren[i], targetChildren[i]);
        }
    }
}
