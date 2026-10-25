import { t, tf } from '@/lang';
import { ImageConfigs } from '@/modes/integrated-mode/integrated-unit/types/constants';

import React, { FC, useState } from 'react';

import { OSetting } from '@obsidian-lib/native-react-components';

import { useUnitsValidation } from '../hooks/useUnitsValidation';
import { useImageConfigOperations } from './hooks/useImageConfigOperations';
import { UnitItemProps } from './types/interfaces';

export const ImagePreset: FC<UnitItemProps> = ({
    unit,
    index,
    modeState,
    setModeState,
}) => {
    const [name] = useState(unit.name);
    const [selector] = useState(unit.selector);

    const [nameError, setNameError] = useState('');
    const [selectorError, setSelectorError] = useState('');

    const { validateName, validateSelector } = useUnitsValidation();

    const { handleSaveEditing, handleDelete, handleToggle } =
        useImageConfigOperations();

    const onKeyDown = async (e: React.KeyboardEvent) => {
        if (e.code === 'Enter') {
            e.preventDefault();
            const result = await handleSaveEditing(index);
            if (result) {
                const validationResult = result.validationResult as {
                    nameResult: { tooltip: string };
                    selectorResult: { tooltip: string };
                };
                const { validated } = result;

                setNameError(validationResult.nameResult.tooltip);
                setSelectorError(validationResult.selectorResult.tooltip);
                if (validated) {
                    setModeState({
                        index: -1,
                        mode: 'none',
                    });
                }
            }
        }
    };

    return modeState.index === index && modeState.mode === 'edit' ? (
        <OSetting>
            <input
                id={'editing-name-input'}
                type={'text'}
                value={name}
                className={nameError.trim() ? 'invalid' : ''}
                aria-label={nameError}
                onChange={(e) => {
                    const value = e.target.value;
                    const validationResult = validateName(value, unit);
                    setNameError(validationResult.tooltip);
                }}
                onKeyDown={(e) => void onKeyDown(e)}
            />
            <input
                id='editing-selector-input'
                type={'text'}
                value={selector}
                className={selectorError.trim() ? '' : ''}
                aria-label={selectorError}
                onChange={(e) => {
                    const value = e.target.value;
                    const validationResult = validateSelector(value, unit);
                    setSelectorError(validationResult.tooltip);
                }}
                onKeyDown={(e) => void onKeyDown(e)}
            />
            <button
                aria-label={
                    t.settings.pages.images.presets.availableImageConfigs.item
                        .buttons.cancel
                }
                onClick={() => {
                    setModeState({
                        index: -1,
                        mode: 'none',
                    });
                }}
                data-icon={'circle-x'}
            />
            <button
                aria-label={tf(
                    t.settings.pages.images.presets.availableImageConfigs.item
                        .buttons.save,
                    { name: unit.name }
                )}
                onClick={() => {
                    void (async () => {
                        const result = await handleSaveEditing(index);
                        if (result) {
                            const validationResult =
                                result.validationResult as {
                                    nameResult: { tooltip: string };
                                    selectorResult: { tooltip: string };
                                };
                            const { validated } = result;
                            setNameError(validationResult.nameResult.tooltip);
                            setSelectorError(
                                validationResult.selectorResult.tooltip
                            );
                            if (validated) {
                                setModeState({
                                    index: -1,
                                    mode: 'none',
                                });
                            }
                        } else {
                            setModeState({
                                index: -1,
                                mode: 'none',
                            });
                        }
                    })();
                }}
                data-icon={'save'}
            />
        </OSetting>
    ) : (
        <OSetting
            name={unit.name}
            desc={unit.selector}
        >
            <input
                type={'checkbox'}
                checked={unit.on}
                aria-label={
                    unit.on
                        ? tf(
                              t.settings.pages.images.presets
                                  .availableImageConfigs.item.toggle.disable,
                              {
                                  name: unit.name,
                              }
                          )
                        : tf(
                              t.settings.pages.images.presets
                                  .availableImageConfigs.item.toggle.enable,
                              {
                                  name: unit.name,
                              }
                          )
                }
                onChange={(e) => {
                    void (async () => {
                        await handleToggle(index, e.target.checked);
                    })();
                }}
            />

            {![ImageConfigs.IMG_SVG, ImageConfigs.Default].contains(
                unit.selector as ImageConfigs
            ) && (
                <>
                    <button
                        aria-label={tf(
                            t.settings.pages.images.presets
                                .availableImageConfigs.item.buttons.edit,
                            {
                                name: unit.name,
                            }
                        )}
                        onClick={() => {
                            setModeState({
                                index,
                                mode: 'edit',
                            });
                        }}
                        data-icon={'edit'}
                    />

                    <button
                        aria-label={tf(
                            t.settings.pages.images.presets
                                .availableImageConfigs.item.buttons.delete,
                            {
                                name: unit.name,
                            }
                        )}
                        onClick={() => {
                            void (async () => {
                                await handleDelete(index);
                            })();
                        }}
                        data-icon={'trash'}
                    />
                </>
            )}
            <button
                aria-label={tf(
                    t.settings.pages.images.presets.availableImageConfigs.item
                        .buttons.options,
                    { name: unit.name }
                )}
                onClick={() => {
                    setModeState({
                        index,
                        mode: 'options',
                    });
                }}
                data-icon={'settings'}
            />
        </OSetting>
    );
};
