import { usePopupContext } from '@/modes/popup-mode/ui/core/PopupContext';
import { BaseButton } from '@/modes/popup-mode/ui/popup/Popup.styled';

import { ReactElement, useEffect, useState } from 'react';

import styled from 'styled-components';

const SFooter = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 10px;
`;

const Counter = styled.div`
    color: #fff;
    font-size: 14px;
    font-weight: 500;
`;

const GalleryContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 5px;
`;

const generateThumbnail = (
    image: HTMLImageElement,
    maxWidth = 150,
    maxHeight = 150
): Promise<string> => new Promise((resolve) => {
        const crossOriginImage = new Image();
        crossOriginImage.crossOrigin = 'anonymous';

        crossOriginImage.onload = () => {
            const canvas = createEl('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(image.src);
                return;
            }

            const ratio = Math.min(
                maxWidth / crossOriginImage.naturalWidth,
                maxHeight / crossOriginImage.naturalHeight
            );
            const newWidth = crossOriginImage.naturalWidth * ratio;
            const newHeight = crossOriginImage.naturalHeight * ratio;

            canvas.width = newWidth;
            canvas.height = newHeight;

            ctx.drawImage(crossOriginImage, 0, 0, newWidth, newHeight);

            try {
                resolve(canvas.toDataURL('image/png', 0.7));
            } catch {
                resolve(image.src);
            }
        };

        crossOriginImage.onerror = () => {
            resolve(image.src);
        };

        crossOriginImage.src = image.src;
    });

const ThumbnailButton = styled(BaseButton)<{
    $isActive: boolean;
    $opacity: number;
}>`
    width: 60px;
    height: 60px;
    margin: 0;
    border: ${(props) =>
        props.$isActive ? '2px solid #007acc' : '1px solid #ccc'};
    transform: ${(props) => (props.$isActive ? 'scale(1.02)' : 'scale(1)')};
    box-shadow: ${(props) =>
        props.$isActive
            ? '0 6px 12px rgba(0,0,0,0.25)'
            : '0 2px 4px rgba(0,0,0,0.1)'};
    opacity: ${(props) => props.$opacity};
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease,
        opacity 0.2s ease;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const Footer = (): ReactElement => {
    const { images, activeImageIndex, setActiveImageIndex } = usePopupContext();
    const [thumbnails, setThumbnails] = useState<string[]>([]);

    const [paginatedThumbnails, setPaginatedThumbnails] = useState<string[]>(
        []
    );

    useEffect(() => {
        const generateThumbnails = async () => {
            const thumbs = await Promise.all(
                images.map(async (image) => {
                    if (image instanceof HTMLImageElement) {
                        return generateThumbnail(image);
                    }
                    return '';
                })
            );
            setThumbnails(thumbs);
        };

        void generateThumbnails();
    }, [images]);

    useEffect(() => {
        const VISIBLE_COUNT = 11;
        const HALF_COUNT = Math.floor(VISIBLE_COUNT / 2);

        let startIndex = Math.max(0, activeImageIndex - HALF_COUNT);
        const endIndex = Math.min(thumbnails.length, startIndex + VISIBLE_COUNT);

        if (endIndex - startIndex < VISIBLE_COUNT) {
            startIndex = Math.max(0, endIndex - VISIBLE_COUNT);
        }

        const paginated = thumbnails.slice(startIndex, endIndex);
        setPaginatedThumbnails(paginated);
    }, [thumbnails, activeImageIndex]);

    return (
        <SFooter>
            <Counter>
                {activeImageIndex + 1} / {images.length}
            </Counter>
            <GalleryContainer>
                {paginatedThumbnails.map((thumb, index) => {
                    const HALF_COUNT = Math.floor(11 / 2);
                    let startIndex = Math.max(0, activeImageIndex - HALF_COUNT);
                    const endIndex = Math.min(thumbnails.length, startIndex + 11);

                    if (endIndex - startIndex < 11) {
                        startIndex = Math.max(0, endIndex - 11);
                    }

                    const globalIndex = startIndex + index;
                    const isActive = globalIndex === activeImageIndex;

                    const distanceFromCenter = Math.abs(index - 5);
                    const opacity = isActive
                        ? 1
                        : Math.max(0.3, 1 - distanceFromCenter * 0.15);

                    return (
                        <ThumbnailButton
                            key={globalIndex}
                            $isActive={isActive}
                            $opacity={opacity}
                            onClick={() => setActiveImageIndex(globalIndex)}
                        >
                            <img
                                src={thumb}
                                alt={`Thumbnail ${globalIndex}`}
                            />
                        </ThumbnailButton>
                    );
                })}{' '}
            </GalleryContainer>
        </SFooter>
    );
};
export default Footer;
