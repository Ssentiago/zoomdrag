import { DragItem, PanelPosition } from '@/settings/types/interfaces';
import { useSettingsContext } from '@/settings/ui/core/SettingsContext';

import React, { useState } from 'react';

import { Platform } from 'obsidian';

import { useDragDropProps } from './types/interfaces';

const calculatePosition = (
    x: number,
    y: number,
    containerRect: DOMRect
): PanelPosition => {
    const PANEL_WIDTH = 60;
    const PANEL_HEIGHT = 40;
    const SNAP_THRESHOLD = 30;

    const calculateVerticalPosition = (
        panelTop: number,
        panelBottom: number,
        containerHeight: number
    ): Partial<PanelPosition> => {
        if (panelTop <= SNAP_THRESHOLD) {
            return { top: '0px' };
        }
        if (containerHeight - panelBottom <= SNAP_THRESHOLD) {
            return { bottom: '0px' };
        }
        return { top: `${((panelTop / containerHeight) * 100).toFixed(1)}%` };
    };

    const calculateHorizontalPosition = (
        panelLeft: number,
        panelRight: number,
        containerWidth: number
    ): Partial<PanelPosition> => {
        if (panelLeft <= SNAP_THRESHOLD) {
            return { left: '0px' };
        }
        if (containerWidth - panelRight <= SNAP_THRESHOLD) {
            return { right: '0px' };
        }
        return { left: `${((panelLeft / containerWidth) * 100).toFixed(1)}%` };
    };

    const position: PanelPosition = {};

    // Coordinates of the panel edges
    const panelLeft = x;
    const panelRight = x + PANEL_WIDTH;
    const panelTop = y;
    const panelBottom = y + PANEL_HEIGHT;

    // Distances from the edges of the panel to the edges of the container
    const distanceToLeft = panelLeft;
    const distanceToRight = containerRect.width - panelRight;
    const distanceToTop = panelTop;
    const distanceToBottom = containerRect.height - panelBottom;

    // Find the minimum distance to the edge
    const distances = [
        { edge: 'left', value: distanceToLeft },
        { edge: 'right', value: distanceToRight },
        { edge: 'top', value: distanceToTop },
        { edge: 'bottom', value: distanceToBottom },
    ];

    const closestEdge = distances.reduce((a, b) =>
        Math.abs(a.value) < Math.abs(b.value) ? a : b
    );

    // Attach to the nearest edge if in the attraction zone
    if (Math.abs(closestEdge.value) <= SNAP_THRESHOLD) {
        switch (closestEdge.edge) {
            case 'left':
                position.left = '0px';
                Object.assign(
                    position,
                    calculateVerticalPosition(
                        panelTop,
                        panelBottom,
                        containerRect.height
                    )
                );
                break;

            case 'right':
                position.right = '0px';
                Object.assign(
                    position,
                    calculateVerticalPosition(
                        panelTop,
                        panelBottom,
                        containerRect.height
                    )
                );
                break;

            case 'top':
                position.top = '0px';
                Object.assign(
                    position,
                    calculateHorizontalPosition(
                        panelLeft,
                        panelRight,
                        containerRect.width
                    )
                );
                break;

            case 'bottom':
                position.bottom = '0px';
                Object.assign(
                    position,
                    calculateHorizontalPosition(
                        panelLeft,
                        panelRight,
                        containerRect.width
                    )
                );
                break;
        }
    } else {
        // If not in the attraction zone, use exact coordinates
        position.left = `${((panelLeft / containerRect.width) * 100).toFixed(1)}%`;
        position.top = `${((panelTop / containerRect.height) * 100).toFixed(1)}%`;
    }

    return position;
};

const useDragDrop = ({
    unitPreviewRef,
    panels,
}: useDragDropProps): {
    draggedPanel: string | null;
    props: Record<string, unknown>;
} => {
    const { plugin } = useSettingsContext();

    const [draggedPanel, setDraggedPanel] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, panelName: string): void => {
        const panel = e.currentTarget as HTMLElement;
        const rect = panel.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        e.dataTransfer.setData(
            'application/json',
            JSON.stringify({
                panelName,
                offsetX,
                offsetY,
            })
        );
        setDraggedPanel(panelName);
    };

    const handleDrop = async (e: React.DragEvent): Promise<void> => {
        e.preventDefault();
        if (!unitPreviewRef.current) {
            return;
        }
        const container = unitPreviewRef.current;

        const containerRect = container.getBoundingClientRect();
        const data = JSON.parse(
            e.dataTransfer.getData('application/json')
        ) as DragItem;

        const x = e.clientX - containerRect.left - data.offsetX;
        const y = e.clientY - containerRect.top - data.offsetY;

        const position = calculatePosition(x, y, containerRect);

        const panelName = data.panelName as keyof typeof panels;
        panels[panelName].position = position;
        setDraggedPanel(null);
        await plugin.settings.save();
    };

    const handleTouchStart = (e: React.TouchEvent, panelName: string): void => {
        const touch = e.touches[0];
        const panel = e.target as HTMLElement;
        const rect = panel.getBoundingClientRect();
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;
        setDraggedPanel(panelName);
        panel.dataset.dragData = JSON.stringify({
            panelName,
            offsetX,
            offsetY,
        });
    };
    const handleTouchMove = (e: React.TouchEvent): void => {
        const container = unitPreviewRef.current;
        if (!container || draggedPanel) {
            return;
        }
        e.preventDefault();

        const touch = e.touches[0];
        const panel = e.currentTarget as HTMLElement;
        const dragData = JSON.parse(
            panel.dataset.dragData ?? '{}'
        ) as { offsetX: number; offsetY: number };
        const containerRect = container.getBoundingClientRect();
        const x = touch.clientX - containerRect.left - dragData.offsetX;
        const y = touch.clientY - containerRect.top - dragData.offsetY;
        const position = calculatePosition(x, y, containerRect);

        panel.style.left = position.left ?? '';
        panel.style.top = position.top ?? '';
    };

    const handleTouchEnd = async (e: React.TouchEvent): Promise<void> => {
        const container = unitPreviewRef.current;
        if (!container || !draggedPanel) {
            return;
        }

        const panel = e.currentTarget as HTMLElement;
        const dragData = JSON.parse(
            panel.dataset.dragData ?? '{}'
        ) as {
            offsetX: number;
            offsetY: number;
            panelName: keyof typeof panels;
        };
        const touch = e.changedTouches[0];

        const containerRect = container.getBoundingClientRect();
        const x = touch.clientX - containerRect.left - dragData.offsetX;
        const y = touch.clientY - containerRect.top - dragData.offsetY;

        const position = calculatePosition(x, y, containerRect);

        const panelName = dragData.panelName;
        panels[panelName].position = position;

        setDraggedPanel(null);
        await plugin.settings.save();
    };

    const props = Platform.isDesktopApp
        ? {
              panel: (name: string) => ({
                      draggable: true,
                      onDragStart: (e: React.DragEvent) =>
                          handleDragStart(e, name),
                  }),
              container: {
                  onDrop: handleDrop,
                  onDragOver: (e: React.DragEvent) => e.preventDefault(),
              },
          }
        : {
              panel: (name: string) => ({
                      onTouchStart: (e: React.TouchEvent) =>
                          handleTouchStart(e, name),
                      onTouchMove: (e: React.TouchEvent) => handleTouchMove(e),
                      onTouchEnd: (e: React.TouchEvent) => handleTouchEnd(e),
                  }),
              container: {},
          };

    return {
        draggedPanel,
        props,
    };
};

export default useDragDrop;
