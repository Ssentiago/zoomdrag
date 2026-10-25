import { usePopupContext } from '@/modes/popup-mode/ui/core/PopupContext';
import useDrag from '@/modes/popup-mode/ui/hooks/useDrag';
import {
    Badge,
    MinimizedButton,
} from '@/modes/popup-mode/ui/popup/popup-content/minimized-mode/MinimizedMode.styled';
import { ViewMode } from '@/modes/popup-mode/ui/popup/types/definitions';

import { FC, useEffect, useState } from 'react';

import { Maximize } from 'lucide-react';

export const MinimizedMode: FC<{
    setMode: (mode: ViewMode) => void;
}> = ({ setMode }) => {
    const { images } = usePopupContext();
    const [imageCount, setImageCount] = useState(images.length);

    useEffect(() => {
        setImageCount(images.length);
    }, [images]);

    const { position, isDragging, dragHandlers } = useDrag({
        initialPosition: { x: 20, y: 80 },
        onDragEnd: (wasDragged) => {
            if (!wasDragged) {
                setMode('maximized');
            }
        },
    });

    useEffect(() => {
        if (!isDragging) return undefined;

        document.addEventListener('mousemove', dragHandlers.onMouseMove);
        document.addEventListener('mouseup', dragHandlers.onMouseUp);
        return () => {
            document.removeEventListener('mousemove', dragHandlers.onMouseMove);
            document.removeEventListener('mouseup', dragHandlers.onMouseUp);
        };
    }, [isDragging, dragHandlers.onMouseMove, dragHandlers.onMouseUp]);

    return (
        <MinimizedButton
            data-tooltip={`Show popup (${imageCount} images)`}
            $x={position.x}
            $y={position.y}
            onMouseDown={dragHandlers.onMouseDown}
        >
            <Maximize />
            {imageCount > 0 && <Badge>{imageCount}</Badge>}
        </MinimizedButton>
    );
};
