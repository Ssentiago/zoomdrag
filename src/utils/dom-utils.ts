export function isInsideMarkdownDOM(element: Element): boolean {
    const leafContent = element.closest('.workspace-leaf-content');
    return leafContent?.getAttribute('data-type') === 'markdown';
}

/**
 * Check if the given element is an "svg-icon", which is an SVG element used as an icon.
 * An SVG element is considered an icon if it is directly inside a button,
 * or if it is directly inside an element with class "edit-block-button",
 * or if it has class "svg-icon", or if it is small (<= 32x32 pixels).
 *
 * @param element - The element to check.
 * @returns True if the element is an svg-icon, false otherwise.
 */
export function isThisSvgIcon(element: Element): boolean {
    // Fast verification - not svg at all
    if (!(element.instanceOf(SVGElement))) {
        return false;
    }

    const svg = element;

    // Checking the button
    if (svg.closest('button') || svg.closest('.edit-block-button')) {
        return true;
    }

    // Class check
    if (svg.classList.contains('svg-icon')) {
        return true;
    }

    // SVG sizes
    const rect = svg.getBoundingClientRect();
    if (
        rect.width > 0 &&
        rect.width <= 32 &&
        rect.height > 0 &&
        rect.height <= 32
    ) {
        return true;
    }

    // The dimensions of the parent
    const parent = svg.parentElement;
    if (parent) {
        const pRect = parent.getBoundingClientRect();
        if (
            pRect.width > 0 &&
            pRect.width <= 32 &&
            pRect.height > 0 &&
            pRect.height <= 32
        ) {
            return true;
        }
    }

    return false;
}
