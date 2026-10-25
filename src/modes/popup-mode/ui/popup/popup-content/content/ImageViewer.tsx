import React, { FC, useEffect, useState } from 'react';

interface ImageWrapperProps {
    img: HTMLImageElement | SVGElement;
}

const ImageViewer: FC<ImageWrapperProps> = ({ img }) => {
    return (
        <>
            {img instanceof HTMLImageElement && (
                <img
                    src={img.src}
                    alt={img.src}
                />
            )}
        </>
    );
};

export default ImageViewer;
