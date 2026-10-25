import { HTMLElementWithCMView } from '@/modes/integrated-mode/adapters/types/interfaces';
import {
    PreviewContextData,
    SourceData,
} from '@/modes/integrated-mode/integrated-unit/types/interfaces';
import { isThisSvgIcon } from '@/utils/dom-utils';

import { MarkdownPostProcessorContext, MarkdownView } from 'obsidian';

import { BaseUnitContext } from '../types/interfaces';
import LeafIndex from './leaf-index';

export default class ImageIndexer {
    indexer: MutationObserver | undefined;

    private mutationObserver: MutationObserver | undefined;

    constructor(readonly leafIndex: LeafIndex) {}

    enable(): void {
        this.leafIndex.plugin.registerMarkdownPostProcessor(
            (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
                this.processPreviewImages(el, ctx);
                this.observePreviewChanges(el, ctx);
            }
        );

        this.startLivePreviewObserver();
    }

    disable(): void {
        this.mutationObserver?.disconnect();
    }

    private processPreviewImages(
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ): void {
        const images = this.findImages(el);

        images.forEach((image) => {
            const sourceData = this.getPreviewSource({
                context: ctx,
                contextEl: el,
            });

            const imageType = this.getImageOrigin(image, sourceData);

            const imageData: BaseUnitContext = {
                sourceData: sourceData,
                element: image,
                origin: imageType,
                elementType: image instanceof HTMLImageElement ? 'img' : 'svg',
                mode: 'preview',
            };

            this.finalizePreviewSource(imageData);

            this.leafIndex.pushImageContext(imageData);
        });
    }

    private observePreviewChanges(
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ): void {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of this.filteredMutations(mutations)) {
                for (const image of this.getAddedImages(mutation.addedNodes)) {
                    const sourceData = this.getPreviewSource({
                        context: ctx,
                        contextEl: el,
                    });

                    const imageType = this.getImageOrigin(image, sourceData);

                    const imageData: BaseUnitContext = {
                        sourceData: sourceData,
                        element: image,
                        origin: imageType,
                        elementType:
                            image instanceof HTMLImageElement ? 'img' : 'svg',
                        mode: 'preview',
                    };

                    this.finalizePreviewSource(imageData);

                    this.leafIndex.pushImageContext(imageData);
                }
            }
        });

        observer.observe(el, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
        }, 5000);
    }

    private startLivePreviewObserver(): void {
        if (!this.leafIndex.activeLeafContext) return;

        this.mutationObserver = new MutationObserver((mutations) => {
            for (const mutation of this.filteredMutations(mutations)) {
                if (!(mutation.target instanceof Element)) {
                    continue;
                }
                const isLivePreview = !!mutation.target.closest(
                    '.markdown-source-view'
                );

                if (!isLivePreview) {
                    continue;
                }

                for (const image of this.getAddedImages(mutation.addedNodes)) {
                    const sourceData = this.getLivePreviewSource(image);

                    const imageType = this.getImageOrigin(image, sourceData);

                    const imageData = {
                        origin: imageType,
                        sourceData: sourceData,
                        element: image,
                        elementType:
                            image instanceof HTMLImageElement ? 'img' : 'svg',
                        mode: 'live-preview',
                    } as BaseUnitContext;

                    this.leafIndex.pushImageContext(imageData);
                }
            }
        });

        this.mutationObserver.observe(
            this.leafIndex.activeLeafContext.view.containerEl,
            { childList: true, subtree: true }
        );
    }

    *filteredMutations(
        mutations: MutationRecord[]
    ): IterableIterator<MutationRecord> {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }

            yield mutation;
        }
    }

    private findImages(el: HTMLElement): (HTMLImageElement | SVGElement)[] {
        return Array.from(el.querySelectorAll('img, svg')).filter(
            (img) => !isThisSvgIcon(img)
        ) as (HTMLImageElement | SVGElement)[];
    }

    /**
     * Returns an iterator of image elements (img or svg) that have been
     * added to the given NodeList.
     *
     * Ignores any nodes that are not elements, or that do not have an
     * img or svg tag as a direct or indirect descendant. Also ignores
     * any img or svg elements that are of class cm-widgetBuffer, as these
     * are internal to CodeMirror and should not be interactified.
     */
    private *getAddedImages(
        nodes: NodeList
    ): Generator<HTMLImageElement | SVGElement, void, unknown> {
        for (const node of Array.from(nodes)) {
            if (!(node instanceof Element)) continue;

            const image =
                (node.matches('svg,img') && node) ||
                node.querySelector('svg,img');

            if (
                !image ||
                isThisSvgIcon(image) ||
                image.matches('.cm-widgetBuffer')
            )
                continue;

            yield image as HTMLImageElement | SVGElement;
        }
    }

    getPreviewSource(contextData: PreviewContextData): SourceData {
        const sectionsInfo = contextData.context.getSectionInfo(
            contextData.contextEl
        );

        if (!sectionsInfo) {
            return {
                source: 'No source available',
                lineStart: 0,
                lineEnd: 0,
            };
        }

        if (sectionsInfo.lineEnd === sectionsInfo.lineStart) {
            return {
                source: sectionsInfo.text,
                lineStart: sectionsInfo.lineStart,
                lineEnd: sectionsInfo.lineEnd,
            };
        }

        const { lineStart: ls, lineEnd: le, text } = sectionsInfo;
        const lineStart = ls;
        const lineEnd = le;
        const lines = text.split('\n');
        const source = lines.slice(lineStart, lineEnd + 1).join('\n');

        return {
            source: source,
            lineStart: lineStart,
            lineEnd: lineEnd,
        };
    }

    getLivePreviewSource(element: HTMLImageElement | SVGElement): {
        source: string;
        lineStart: number;
        lineEnd: number;
    } {
        const parent = this.findElementWithLivePreviewWidget(element) as
            | HTMLElementWithCMView
            | undefined;

        const widget = parent?.cmView?.deco?.widget;

        const df = {
            source: 'No source available',
            lineStart: 0,
            lineEnd: 0,
        };

        if (widget === undefined) {
            return df;
        }

        if (
            'title' in widget &&
            'href' in widget &&
            'start' in widget &&
            'end' in widget
        ) {
            return {
                source: `![[${widget.href}]]`,
                lineStart: widget.start,
                lineEnd: widget.end,
            };
        }

        if ('url' in widget && 'start' in widget && 'end' in widget) {
            return {
                source: `![${widget.title || ''}](${widget.url})`,
                lineStart: widget.start,
                lineEnd: widget.end,
            };
        }

        if (
            'code' in widget &&
            'lineStart' in widget &&
            'lineEnd' in widget &&
            'lang' in widget
        ) {
            return {
                source: `\`\`\`${widget.lang}\n${widget.code}\n\`\`\``,
                lineStart: widget.lineStart,
                lineEnd: widget.lineEnd,
            };
        }

        return df;
    }

    protected findElementWithLivePreviewWidget(
        el: Element | undefined
    ): HTMLElementWithCMView | undefined {
        if (el === undefined) {
            return undefined;
        }
        let current = el as HTMLElement | null | undefined;

        while (current && current !== document.body) {
            if ((current as HTMLElementWithCMView)?.cmView) {
                return current as HTMLElementWithCMView;
            }
            current = current?.parentElement;
        }
        return undefined;
    }

    /**
     * Given an image element, a source data object, and the mode, it returns one of
     * 'generated', 'external', or 'local'. This is used to determine if an image
     * is generated by the plugin, external (i.e., hosted on another site), or
     * local.
     *
     * @param image The image element to inspect.
     * @param sourceData The source data object associated with the image.
     * @param mode The mode of the image, either 'preview' or 'live-preview'.
     * @returns One of 'generated', 'external', or 'local'.
     */
    getImageOrigin(
        image: HTMLImageElement | SVGElement,
        sourceData: SourceData
    ): 'generated' | 'external' | 'local' {
        const GENERATED_REGEX = /^```[^\n]+?\n?[\s\S]+?\n?```$/;

        if (GENERATED_REGEX.test(sourceData.source)) {
            return 'generated';
        }

        if ('src' in image && /^https?:\/\//.test(image.src)) {
            return 'external';
        }

        return 'local';
    }

    finalizePreviewSource(imageData: BaseUnitContext): void {
        if (imageData.origin !== 'generated') {
            const alt = 'alt' in imageData.element ? imageData.element.alt : '';
            const src = 'src' in imageData.element ? imageData.element.src : '';
            const sourceData = {
                lineStart: 0,
                lineEnd: 0,
                source: `![${alt}](${src})`,
            };
            imageData.sourceData = sourceData;
        }
    }
}
