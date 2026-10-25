import { t, tf } from '@/lang';
import { ImageConfig } from '@/settings/types/interfaces';
import {
    GlobalValidationResult,
    UnitValidationResult,
    UseUnitsValidationReturn,
} from '@/settings/ui/pages/images/presets/hooks/types/interfaces';

import { useEffect, useState } from 'react';

import { useSettingsContext } from '../../../../core/SettingsContext';
import { useUnitsManagerContext } from '../context/UnitsManagerContext';

// const unitRegexp = /^[\w-]+$/;

export const useUnitsValidation = (): UseUnitsValidationReturn => {
    const { plugin } = useSettingsContext();
    const { units } = useUnitsManagerContext();
    const [unitNamesIndex, setUnitNamesIndex] = useState(new Set());
    const [unitSelectorsIndex, setUnitSelectorsIndex] = useState(new Set());

    const updateUnitNameAndSelectors = (units: ImageConfig[]) => {
        const unitIndexData = {
            names: [] as string[],
            selectors: [] as string[],
        };
        units.forEach((item) => {
            unitIndexData.names.push(item.name);
            unitIndexData.selectors.push(item.selector);
        });
        setUnitNamesIndex(new Set(unitIndexData.names));
        setUnitSelectorsIndex(new Set(unitIndexData.selectors));
    };

    useEffect(() => {
        updateUnitNameAndSelectors(plugin.settings.$.units.configs);
        const handler = () => {
            updateUnitNameAndSelectors(units);
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
    }, [units]);

    const testSelector = (selector: string) => {
        try {
            document.querySelector(selector);
            return { valid: true, err: undefined };
        } catch (err: unknown) {
            const parts = (err.message as string).split(':');
            const message = parts.slice(1).join(':').trim();
            return { valid: false, err: message };
        }
    };

    const validateName = (
        name: string,
        exclude?: ImageConfig
    ): UnitValidationResult => {
        if (!name.trim()) {
            return {
                empty: true,
                tooltip: '',
                valid: false,
            };
        }

        // if (!unitRegexp.test(name)) {
        //     return {
        //         valid: false,
        //         tooltip: 'Incorrect input. Should be only A-Za-z0-9-',
        //         empty: false,
        //     };
        // }

        if (unitNamesIndex.has(name) && exclude?.name !== name) {
            return {
                valid: false,
                tooltip:
                    t.settings.pages.images.presets.unitsValidation
                        .nameAlreadyExists,
                empty: false,
            };
        }

        return { valid: true, tooltip: '', empty: false };
    };

    const validateSelector = (
        selector: string,
        exclude?: ImageConfig
    ): UnitValidationResult => {
        if (!selector.trim()) {
            return {
                empty: true,
                tooltip: '',
                valid: false,
            };
        }

        const { valid, err } = testSelector(selector);
        if (!valid) {
            return {
                valid: false,
                tooltip: tf(
                    t.settings.pages.images.presets.unitsValidation
                        .invalidSelectorPrefix,
                    { err: err ?? '' }
                ),
                empty: false,
            };
        }

        if (
            unitSelectorsIndex.has(selector) &&
            exclude?.selector !== selector
        ) {
            return {
                valid: false,
                tooltip:
                    t.settings.pages.images.presets.unitsValidation
                        .selectorAlreadyExists,
                empty: false,
            };
        }

        return { valid: true, tooltip: '', empty: false };
    };

    const validateBoth = (
        name: string,
        selector: string,
        exclude?: ImageConfig
    ): GlobalValidationResult => {
        const nameResult = validateName(name, exclude);
        const selectorResult = validateSelector(selector, exclude);
        const bothEmpty = nameResult.empty && selectorResult.empty;
        const oneEmpty =
            (nameResult.empty || selectorResult.empty) && !bothEmpty;

        return { nameResult, selectorResult, bothEmpty, oneEmpty };
    };

    const processValidationOnSave = (
        result: GlobalValidationResult
    ): boolean => {
        if (result.bothEmpty) {
            plugin.showNotice(
                t.settings.pages.images.presets.unitsValidation.nothingToSave
            );
            return false;
        }

        if (result.oneEmpty) {
            const field = result.nameResult.empty ? 'name' : 'selector';
            plugin.showNotice(
                tf(
                    t.settings.pages.images.presets.unitsValidation
                        .fillOutField,
                    { field }
                )
            );
            return false;
        }

        const bothInvalid =
            !result.nameResult.valid && !result.selectorResult.valid;
        const oneInvalid =
            !result.nameResult.valid || !result.selectorResult.valid;

        if (bothInvalid) {
            plugin.showNotice(
                t.settings.pages.images.presets.unitsValidation.bothInvalid
            );
            return false;
        }

        if (oneInvalid) {
            const field = !result.nameResult.valid ? 'name' : 'selector';
            plugin.showNotice(
                tf(t.settings.pages.images.presets.unitsValidation.oneInvalid, {
                    field,
                })
            );
            return false;
        }

        return true;
    };

    return {
        validateBoth,
        validateName,
        validateSelector,
        processValidationOnSave,
    };
};
