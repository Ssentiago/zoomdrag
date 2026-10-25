import PopupMode from '@/modes/popup-mode/popup-mode';
import { PopupContextProvider } from '@/modes/popup-mode/ui/core/PopupContext';
import Popup from '@/modes/popup-mode/ui/popup/Popup';

import { FC } from 'react';

interface PopupRootProps {
    popupMode: PopupMode;
    initialImages: Array<HTMLImageElement | SVGElement>;
    onClose: () => void;
}

const PopupRoot: FC<PopupRootProps> = ({
    popupMode,
    initialImages,
    onClose,
}) => (
        <PopupContextProvider
            popupMode={popupMode}
            initialImages={initialImages}
            onClose={onClose}
        >
            <Popup />
        </PopupContextProvider>
    );

export default PopupRoot;
