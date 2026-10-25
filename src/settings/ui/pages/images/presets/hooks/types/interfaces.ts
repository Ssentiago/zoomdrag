import { ImageConfig } from '@/settings/types/interfaces';

export interface UnitValidationResult {
    empty: boolean;
    valid: boolean;
    tooltip: string;
}

export interface GlobalValidationResult {
    nameResult: UnitValidationResult;
    selectorResult: UnitValidationResult;
    bothEmpty: boolean;
    oneEmpty: boolean;
}

export interface UseUnitsValidationReturn {
    validateBoth: (
        name: string,
        selector: string,
        exclude?: ImageConfig
    ) => GlobalValidationResult;
    validateName: (
        name: string,
        exclude?: ImageConfig
    ) => UnitValidationResult;
    validateSelector: (
        selector: string,
        exclude?: ImageConfig
    ) => UnitValidationResult;
    processValidationOnSave: (result: GlobalValidationResult) => boolean;
}

export interface UseUnitsManagerReturn {
    units: ImageConfig[];
    saveUnits: (newUnits: ImageConfig[]) => Promise<void>;
}
