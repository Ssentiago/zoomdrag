import { t, tf } from '@/lang';

import React, { FC, useCallback, useEffect, useState } from 'react';

import { OSetting } from '@obsidian-lib/native-react-components';
import { Platform } from 'obsidian';

import { DimensionType } from '../../../../../types/definitions';
import { useSettingsContext } from '../../../../core/SettingsContext';
import { ComponentType } from './types/constants';
import { DimensionsOptionProps } from './types/interfaces';

const dimensionSpec = {
    px: {
        min: 100,
        max: 1000,
        label: 'px',
        rangeMessage: '100-1000px',
    },
    '%': {
        min: 10,
        max: 100,
        label: '%',
        rangeMessage: '10-100%',
    },
};

const isDimensionInValidRange = (
    value: string,
    unit: DimensionType
): boolean => {
    const n = parseInt(value, 10);
    const { min, max } = dimensionSpec[unit];
    return n >= min && n <= max;
};

const getErrorMessage = (
    field: 'width' | 'height',
    unit: DimensionType
): string => {
    const range =
        unit === 'px'
            ? dimensionSpec.px.rangeMessage
            : dimensionSpec['%'].rangeMessage;
    switch (field) {
        case 'width':
            return tf(
                t.settings.pages.images.general.size.validation.invalidWidth,
                {
                    range,
                }
            );
        case 'height':
            return tf(
                t.settings.pages.images.general.size.validation.invalidHeight,
                {
                    range,
                }
            );
        default:
            return '';
    }
};

const DimensionsOption: FC<DimensionsOptionProps> = ({
    type,
    initialOptions,
}) => {
    const { plugin } = useSettingsContext();

    const [heightUnit, setHeightUnit] = useState(initialOptions.height.type);
    const [widthUnit, setWidthUnit] = useState(initialOptions.width.type);
    const [heightValue, setHeightValue] = useState(
        initialOptions.height.value.toString()
    );
    const [widthValue, setWidthValue] = useState(
        initialOptions.width.value.toString()
    );

    const [heightError, setHeightError] = useState('');
    const [widthError, setWidthError] = useState('');

    const getName = useCallback((): string => {
        switch (type) {
            case ComponentType.Expanded:
                return t.settings.pages.images.general.size.expanded.name;
            case ComponentType.Folded:
                return t.settings.pages.images.general.size.folded.name;
            default:
                return '';
        }
    }, [type]);

    const validateHeight = (value: string, unit: DimensionType) => {
        if (!isDimensionInValidRange(value, unit)) {
            setHeightError(getErrorMessage('height', unit));
            return false;
        }
        setHeightError('');
        return true;
    };

    const validateWidth = (value: string, unit: DimensionType) => {
        if (!isDimensionInValidRange(value, unit)) {
            setWidthError(getErrorMessage('width', unit));
            return false;
        }
        setWidthError('');
        return true;
    };

    const validateDimensionInput = useCallback(
        (
            value: string,
            field: 'width' | 'height',
            unit: DimensionType
        ): void => {
            field === 'height'
                ? validateHeight(value, unit)
                : validateWidth(value, unit);
        },
        []
    );

    useEffect(() => {
        validateDimensionInput(widthValue, 'width', widthUnit);
        validateDimensionInput(heightValue, 'height', heightUnit);
    }, [widthUnit, heightUnit]);

    const handleSave = async () => {
        const isHeightValid = validateHeight(heightValue, heightUnit);
        const isWidthValid = validateWidth(widthValue, widthUnit);

        if (!isHeightValid || !isWidthValid) {
            plugin.showNotice(
                t.settings.pages.images.general.size.validation.fixErrors
            );
            return;
        }

        const inputWidth = parseInt(widthValue, 10);
        const inputHeight = parseInt(heightValue, 10);

        if (
            inputWidth === initialOptions.width.value &&
            inputHeight === initialOptions.height.value &&
            widthUnit === initialOptions.width.type &&
            heightUnit === initialOptions.height.type
        ) {
            plugin.showNotice(
                t.settings.pages.images.general.size.validation.nothingToSave
            );
            return;
        }

        initialOptions.width.value = inputWidth;
        initialOptions.height.value = inputHeight;
        initialOptions.width.type = widthUnit;
        initialOptions.height.type = heightUnit;

        if (type === ComponentType.Folded) {
            plugin.settings.$.units.size.folded = initialOptions;
        } else {
            plugin.settings.$.units.size.expanded = initialOptions;
        }

        await plugin.settings.save();
        plugin.showNotice(
            t.settings.pages.images.general.size.validation.savedSuccessfully
        );
    };

    const onKeyDown = async (e: React.KeyboardEvent) => {
        if (e.code === 'Enter') {
            e.preventDefault();
            await handleSave();
        }
    };

    const renderInputGroup = (
        labelText: string,
        inputId: string,
        value: string,
        error: string,
        unit: DimensionType,
        setValue: (value: string) => void,
        setUnit: (unit: DimensionType) => void,
        validateFn: (value: string, unit: DimensionType) => void
    ) => {
        const content = (
            <>
                <label htmlFor={inputId}>{labelText}</label>
                <input
                    id={inputId}
                    type='text'
                    value={value}
                    className={error.trim() ? 'invalid' : ''}
                    aria-label={
                        error || unit === 'px' ? '100-1000px' : '10-100%'
                    }
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/, '');
                        e.target.value = val;
                        setValue(val);
                        validateFn(val, unit);
                    }}
                    onKeyDown={(e) => void onKeyDown(e)}
                />
                <select
                    value={unit}
                    onChange={(e) => {
                        const u = e.target.value as DimensionType;
                        setUnit(u);
                        validateFn(value, u);
                    }}
                >
                    <option value='px'>px</option>
                    <option value='%'>%</option>
                </select>
            </>
        );

        return Platform.isMobile ? (
            <OSetting noBorder>{content}</OSetting>
        ) : (
            content
        );
    };

    return (
        <>
            <OSetting
                name={getName()}
                noBorder={true}
            />

            {Platform.isMobile ? (
                <>
                    {renderInputGroup(
                        t.settings.pages.images.general.size.labels.height,
                        'height-input',
                        heightValue,
                        heightError,
                        heightUnit,
                        setHeightValue,
                        setHeightUnit,
                        validateHeight
                    )}
                    {renderInputGroup(
                        t.settings.pages.images.general.size.labels.width,
                        'width-input',
                        widthValue,
                        widthError,
                        widthUnit,
                        setWidthValue,
                        setWidthUnit,
                        validateWidth
                    )}
                    <OSetting>
                        <button
                            aria-label={
                                t.settings.pages.images.general.size
                                    .saveButtonTooltip
                            }
                            onClick={() => void handleSave()}
                            data-icon={'save'}
                        />
                    </OSetting>
                </>
            ) : (
                <OSetting>
                    {renderInputGroup(
                        t.settings.pages.images.general.size.labels.height,
                        'height-input',
                        heightValue,
                        heightError,
                        heightUnit,
                        setHeightValue,
                        setHeightUnit,
                        validateHeight
                    )}
                    {renderInputGroup(
                        t.settings.pages.images.general.size.labels.width,
                        'width-input',
                        widthValue,
                        widthError,
                        widthUnit,
                        setWidthValue,
                        setWidthUnit,
                        validateWidth
                    )}
                    <button
                        aria-label={
                            t.settings.pages.images.general.size
                                .saveButtonTooltip
                        }
                        onClick={() => void handleSave()}
                        data-icon={'save'}
                    />
                </OSetting>
            )}
        </>
    );
};

export default DimensionsOption;
