import { useCallback, useEffect, useState } from 'react';

import { UseUnitsManagerReturn } from './types/interfaces';
import { ImageConfig } from '../../../../../types/interfaces';
import { useSettingsContext } from '../../../../core/SettingsContext';

export const useUnitsManager = (): UseUnitsManagerReturn => {
    const { plugin } = useSettingsContext();
    const [units, setUnits] = useState(plugin.settings.$.units.configs);

    useEffect(() => {
        const handler = () => {
            setUnits(plugin.settings.$.units.configs);
        };

        plugin.settings.emitter.on(
            plugin.settings.$$.units.configs.$path,
            handler
        );
        return () => {
            plugin.settings.emitter.off(
                plugin.settings.$$.units.configs.$path,
                handler
            );
        };
    }, [plugin]);

    const saveUnits = useCallback(
        async (newUnits: ImageConfig[]) => {
            setUnits(newUnits);
            plugin.settings.$.units.configs = newUnits;
            await plugin.settings.save();
        },
        [plugin]
    );

    return { units, saveUnits };
};
