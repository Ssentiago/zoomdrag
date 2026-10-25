import { t, tf } from '@/lang';

import React, { FC, useEffect, useMemo, useState } from 'react';

import { OSetting } from '@obsidian-lib/native-react-components';
import { ArrowLeft, ArrowRight, RotateCcw, RotateCw } from 'lucide-react';

import { useSettingsContext } from '../../../../core/SettingsContext';
import { useUnitsHistoryContext } from '../context/HistoryContext';
import { useUnitsManagerContext } from '../context/UnitsManagerContext';
import {
    ButtonContainer,
    PaginationButton,
    PaginationControls,
    RedoButton,
    UndoButton,
} from './AvailableImageConfigs.styled';
import { ImagePreset } from './ImagePreset';
import { usePagination } from './hooks/usePagination';
import { ImageConfigOptionsModal } from './modals/ImageConfigOptionsModal';
import { ModeState } from './types/interfaces';

const AvailableImagePresets: FC = () => {
    const { plugin } = useSettingsContext();

    const paginationTitle: string = useMemo(
        () =>
            t.settings.pages.images.presets.availableImageConfigs.pagination
                .page,
        [plugin]
    );

    const [unitsPerPage, setUnitsPerPage] = useState(
        plugin.settings.$.units.settingsPagination.perPage
    );
    const { units } = useUnitsManagerContext();
    const [modeState, setModeState] = useState<ModeState>({
        mode: 'none',
        index: -1,
    });

    const { navigateToPage, totalPages, pageStartIndex, pageEndIndex, page } =
        usePagination({
            itemsPerPage: unitsPerPage,
            totalItems: units.length,
        });

    const {
        updateUndoStack,
        undo,
        canUndo,
        canRedo,
        getRedoLabel,
        redo,
        getUndoLabel,
    } = useUnitsHistoryContext();

    useEffect(() => {
        const handler = () => {
            setUnitsPerPage(plugin.settings.$.units.settingsPagination.perPage);
        };

        plugin.settings.emitter.on(
            plugin.settings.$$.units.settingsPagination.perPage.$path,
            handler
        );
        return (): void => {
            plugin.settings.emitter.off(
                plugin.settings.$$.units.settingsPagination.perPage.$path,
                handler
            );
        };
    }, [plugin]);

    const visibleDUnits = useMemo(() => units.slice(pageStartIndex, pageEndIndex), [units, pageStartIndex, pageEndIndex]);

    const getPageChangeButtonLabel = (type: 'previous' | 'next'): string => {
        const canChange = type === 'next' ? page < totalPages : page > 1;

        if (modeState.mode === 'edit' && canChange) {
            return t.settings.pages.images.presets.availableImageConfigs
                .pagination.buttons.editingBlocked;
        }

        switch (type) {
            case 'previous':
                return canChange
                    ? t.settings.pages.images.presets.availableImageConfigs
                          .pagination.buttons.previous.enabled
                    : t.settings.pages.images.presets.availableImageConfigs
                          .pagination.buttons.previous.disabled;
            case 'next':
                return canChange
                    ? t.settings.pages.images.presets.availableImageConfigs
                          .pagination.buttons.next.enabled
                    : t.settings.pages.images.presets.availableImageConfigs
                          .pagination.buttons.next.disabled;
            default:
                return '';
        }
    };

    return (
        <>
            <OSetting
                name={
                    t.settings.pages.images.presets.availableImageConfigs.header
                }
                heading
            />
            <OSetting
                name={
                    t.settings.pages.images.presets.availableImageConfigs
                        .perPageSlider.name
                }
                disabled={modeState.mode === 'edit'}
            >
                <input
                    type={'range'}
                    min={1}
                    max={50}
                    step={1}
                    onChange={(e) => {
                        void (async () => {
                            plugin.settings.$.units.settingsPagination.perPage =
                                parseInt(e.target.value, 10);
                            await plugin.settings.save();
                        })();
                    }}
                />
            </OSetting>
            <ButtonContainer>
                <UndoButton
                    onClick={() => void undo()}
                    disabled={!canUndo}
                    aria-label={getUndoLabel()}
                >
                    <RotateCcw size={'20px'} />
                </UndoButton>

                <PaginationControls>
                    <PaginationButton
                        onClick={() => navigateToPage(-1)}
                        disabled={page === 1 || modeState.mode === 'edit'}
                        aria-label={getPageChangeButtonLabel('previous')}
                    >
                        <ArrowLeft size={'20px'} />
                    </PaginationButton>
                    {tf(paginationTitle, {
                        current: page.toString(),
                        total: totalPages.toString(),
                        count: units.length.toString(),
                    })}
                    <PaginationButton
                        onClick={() => navigateToPage(1)}
                        disabled={
                            page === totalPages || modeState.mode === 'edit'
                        }
                        aria-label={getPageChangeButtonLabel('next')}
                    >
                        <ArrowRight size={'20px'} />
                    </PaginationButton>
                </PaginationControls>

                <RedoButton
                    disabled={!canRedo}
                    onClick={() => void redo()}
                    aria-label={getRedoLabel()}
                >
                    <RotateCw size={'20px'} />
                </RedoButton>
            </ButtonContainer>

            {visibleDUnits.map((unit, index) => (
                <ImagePreset
                    key={`${unit.name}-${unit.selector}`}
                    unit={unit}
                    index={pageStartIndex + index}
                    modeState={modeState}
                    setModeState={setModeState}
                />
            ))}

            {modeState.mode === 'options' && modeState.index !== -1 && (
                <ImageConfigOptionsModal
                    unitIndex={modeState.index}
                    onChanges={updateUndoStack}
                    onClose={() => {
                        setModeState({
                            mode: 'none',
                            index: -1,
                        });
                    }}
                />
            )}
        </>
    );
};

export default AvailableImagePresets;
