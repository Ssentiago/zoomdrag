import { t, tf } from '@/lang';

import React, { FC, useState } from 'react';

import { OSetting } from '@obsidian-lib/native-react-components';
import { Platform } from 'obsidian';

import { useSettingsContext } from '../../../../core/SettingsContext';
import { useUnitsHistoryContext } from '../context/HistoryContext';
import { useUnitsManagerContext } from '../context/UnitsManagerContext';
import { useUnitsValidation } from '../hooks/useUnitsValidation';
import UserGuideModal from './modals/UserGuideModal';

const AddNewImagePreset: FC = () => {
    const { plugin } = useSettingsContext();
    const [guideOpen, setGuideOpen] = useState(false);
    const {
        validateSelector,
        validateBoth,
        validateName,
        processValidationOnSave,
    } = useUnitsValidation();

    const [name, setName] = useState('');
    const [selector, setSelector] = useState('');
    const [nameError, setNameError] = useState('');
    const [selectorError, setSelectorError] = useState('');

    const { units, saveUnits } = useUnitsManagerContext();

    const { updateUndoStack } = useUnitsHistoryContext();

    const handleAddUnit = async (): Promise<void> => {
        const validationResult = validateBoth(name, selector);

        const validated = processValidationOnSave(validationResult);
        if (!validated) {
            return;
        }

        const oldUnits = [...units];

        const newUnit = {
            name,
            selector,
            on: true,
            panels: {
                move: {
                    on: true,
                },
                zoom: {
                    on: true,
                },
                service: {
                    on: true,
                },
            },
        };

        const newUnits = [...units, newUnit];

        await saveUnits(newUnits);
        updateUndoStack(
            oldUnits,
            tf(
                t.settings.pages.images.presets.addNewImagePreset.undoStack
                    .addAction,
                {
                    name: newUnit.name,
                    selector: newUnit.selector,
                }
            )
        );
        plugin.showNotice(
            t.settings.pages.images.presets.addNewImagePreset.notice
                .newConfigAdded
        );
        setName('');
        setSelector('');
    };

    const onKeyDown = async (e: React.KeyboardEvent) => {
        if (e.code === 'Enter') {
            e.preventDefault();
            await handleAddUnit();
        }
    };

    const renderGroup = () => {
        const nameInput = () => (
            <input
                id={'unit-name'}
                type={'text'}
                className={nameError.trim() ? 'invalid' : ''}
                placeholder={
                    t.settings.pages.images.presets.addNewImagePreset
                        .placeholders.name
                }
                value={name}
                aria-label={nameError}
                onChange={(e) => {
                    const value = e.target.value;
                    setName(value);
                    setNameError(validateName(name).tooltip);
                }}
                onKeyDown={(e) => void onKeyDown(e)}
            />
        );

        const selectorInput = () => (
            <input
                id={'unit-selector'}
                type={'text'}
                value={selector}
                className={selectorError.trim() ? 'invalid' : ''}
                aria-label={selectorError}
                placeholder={
                    t.settings.pages.images.presets.addNewImagePreset
                        .placeholders.selector
                }
                onChange={(e) => {
                    const value = e.target.value;
                    setSelector(value);
                    const validationResult = validateSelector(value);
                    setSelectorError(validationResult.tooltip);
                }}
                onKeyDown={(e) => void onKeyDown(e)}
            />
        );

        const saveButton = () => (
            <button
                aria-label={
                    t.settings.pages.images.presets.addNewImagePreset.tooltips
                        .saveButton
                }
                onClick={() => void handleAddUnit()}
                data-icon={'save'}
            />
        );

        return Platform.isMobile ? (
            <>
                <OSetting noBorder>{nameInput()}</OSetting>
                <OSetting noBorder>{selectorInput()}</OSetting>
                <OSetting noBorder>{saveButton()}</OSetting>
            </>
        ) : (
            <OSetting>
                {nameInput()}
                {selectorInput()}
                {saveButton()}
                <button
                    aria-label={
                        t.settings.pages.images.presets.addNewImagePreset
                            .tooltips.infoButton
                    }
                    onClick={() => {
                        setGuideOpen(true);
                    }}
                    data-icon={'info'}
                />
            </OSetting>
        );
    };

    return (
        <>
            <OSetting
                name={t.settings.pages.images.presets.addNewImagePreset.header}
                heading
                noBorder
                desc={t.settings.pages.images.presets.addNewImagePreset.desc}
            />

            {renderGroup()}

            {guideOpen && (
                <UserGuideModal onClose={() => setGuideOpen(false)} />
            )}
        </>
    );
};

export default AddNewImagePreset;
