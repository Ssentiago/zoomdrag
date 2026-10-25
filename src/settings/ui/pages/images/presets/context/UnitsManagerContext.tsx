import {
    UnitManagerContextProps,
    UnitsManagerProviderProps,
} from '@/settings/ui/pages/images/presets/context/types/interfaces';

import React, { createContext, useContext, useMemo } from 'react';

import { useUnitsManager } from '../hooks/useUnitsManager';

const UnitsManagerContext = createContext<UnitManagerContextProps | undefined>(
    undefined
);

export const UnitsManagerProvider = ({
    children,
}: UnitsManagerProviderProps): React.ReactElement => {
    const { units, saveUnits } = useUnitsManager();

    const contextValue = useMemo(
        () => ({
            units,
            saveUnits,
        }),
        [units, saveUnits]
    );

    return (
        <UnitsManagerContext.Provider value={contextValue}>
            {children}
        </UnitsManagerContext.Provider>
    );
};

export const useUnitsManagerContext = (): UnitManagerContextProps => {
    const context = useContext(UnitsManagerContext);
    if (context === undefined) {
        throw new Error(
            'useUnitsManagerContext must be used within a UnitsManagerProvider'
        );
    }
    return context;
};
