import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

import { SettingProviderProps, SettingsContextProps } from './types/interfaces';

const SettingsContext = createContext<SettingsContextProps | undefined>(
    undefined
);

export const SettingProvider = ({
    app,
    plugin,
    children,
}: SettingProviderProps): React.ReactElement => {
    const [reloadCount, setReloadCount] = useState(0);

    const forceReload = useCallback(() => {
        setReloadCount((prev) => prev + 1);
    }, []);

    const contextValue: SettingsContextProps = useMemo(
        () => ({
            app,
            plugin,
            forceReload,
            reloadCount,
        }),
        [app, plugin, forceReload, reloadCount]
    );

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettingsContext = (): SettingsContextProps => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error(
            'useSettingsContext must be used within a SettingProvider'
        );
    }
    return context;
};
