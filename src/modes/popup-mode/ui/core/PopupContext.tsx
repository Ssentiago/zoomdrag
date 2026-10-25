import PopupMode from '@/modes/popup-mode/popup-mode';

import React, {
    createContext,
    FC,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from 'react';

interface PopupContextProps {
    popupMode: PopupMode;
    images: Array<HTMLImageElement | SVGElement>;
    setImages: React.Dispatch<
        React.SetStateAction<Array<HTMLImageElement | SVGElement>>
    >;
    activeImageIndex: number;
    setActiveImageIndex: (index: number) => void;
    onClose: () => void;
}

interface PopupProviderProps {
    popupMode: PopupMode;
    initialImages: Array<HTMLImageElement | SVGElement>;
    onClose: () => void;
    children: ReactNode;
}

const PopupContext = createContext<PopupContextProps | undefined>(undefined);

export const PopupContextProvider: FC<PopupProviderProps> = ({
    popupMode,
    initialImages,
    onClose,
    children,
}) => {
    const [images, setImages] =
        useState<Array<HTMLImageElement | SVGElement>>(initialImages);

    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const contextValue = useMemo(
        () => ({
            popupMode,
            onClose,
            images,
            setImages,
            activeImageIndex,
            setActiveImageIndex,
        }),
        [
            popupMode,
            onClose,
            images,
            setImages,
            activeImageIndex,
            setActiveImageIndex,
        ]
    );

    return (
        <PopupContext.Provider value={contextValue}>
            {children}
        </PopupContext.Provider>
    );
};

export const usePopupContext = (): PopupContextProps => {
    const context = useContext(PopupContext);
    if (context === undefined) {
        throw new Error('usePopupContext must be used within a PopupProvider');
    }
    return context;
};
