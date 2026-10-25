import React, { useCallback, useState } from 'react';

interface UseDragProps {
    initialPosition: { x: number; y: number };
    onDragEnd: (wasDragged: boolean) => void;
}

interface UseDragReturn {
    position: { x: number; y: number };
    isDragging: boolean;
    dragHandlers: {
        onMouseDown: (e: React.MouseEvent) => void;
        onMouseMove: (e: MouseEvent) => void;
        onMouseUp: () => void;
    };
}

const useDrag = ({
    initialPosition,
    onDragEnd,
}: UseDragProps): UseDragReturn => {
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(initialPosition);

    const [hasActuallyDragged, setHasActuallyDragged] = useState(false);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        setHasActuallyDragged(false);
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }, []);

    const onMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;
            setHasActuallyDragged(true);
            setPosition({
                x: window.innerWidth - (e.clientX - dragOffset.x) - 50,
                y: window.innerHeight - (e.clientY - dragOffset.y) - 50,
            });
        },
        [isDragging, dragOffset]
    );

    const onMouseUp = useCallback(() => {
        setIsDragging(false);

        onDragEnd(hasActuallyDragged);
    }, [hasActuallyDragged, onDragEnd]);

    return {
        position,
        isDragging,
        dragHandlers: {
            onMouseDown,
            onMouseMove,
            onMouseUp,
        },
    };
};

export default useDrag;
