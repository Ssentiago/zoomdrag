import React, { FC } from 'react';

interface ImageWrapperProps {
    img: HTMLImageElement | SVGElement;
}

const ImageViewer: FC<ImageWrapperProps> = ({ img }) => (
        <>
            {img instanceof HTMLImageElement && (
                <img
                    src={img.src}
                    alt={img.src}
                />
            )}
        </>
    );

export default ImageViewer;
