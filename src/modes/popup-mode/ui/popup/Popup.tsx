import { Overlay } from '@/modes/popup-mode/ui/popup/Popup.styled';
import Content from '@/modes/popup-mode/ui/popup/popup-content/content/Content';
import Footer from '@/modes/popup-mode/ui/popup/popup-content/footer/Footer';
import { Header } from '@/modes/popup-mode/ui/popup/popup-content/header/Header';
import { MinimizedMode } from '@/modes/popup-mode/ui/popup/popup-content/minimized-mode/MinimizedMode';
import { ViewMode } from '@/modes/popup-mode/ui/popup/types/definitions';

import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';

import { usePopupContext } from '../core/PopupContext';

const PopupContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`;
const Popup = (): React.ReactElement => {
    const { popupMode, onClose, setActiveImageIndex, setImages, images } =
        usePopupContext();
    const [mode, setMode] = useState<ViewMode>('maximized');

    useEffect(() => {
        const handler = (image: HTMLImageElement) => {
            const newIndex = images.length;
            setImages((prev) => [...prev, image]);
            setActiveImageIndex(newIndex);
            setMode('maximized');
        };

        popupMode.plugin.emitter.on('image.popup.show', handler);

        return () => {
            popupMode.plugin.emitter.off('image.popup.show', handler);
        };
    }, []);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleOverlayClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    return mode === 'maximized' ? (
        <Overlay onClick={handleOverlayClick}>
            <PopupContainer>
                <Header setMode={setMode} />
                <Content />
                <Footer />
            </PopupContainer>
        </Overlay>
    ) : (
        <MinimizedMode setMode={setMode} />
    );
};

export default Popup;
