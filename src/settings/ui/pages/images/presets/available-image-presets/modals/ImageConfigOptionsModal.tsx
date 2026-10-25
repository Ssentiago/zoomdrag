import { t, tf } from '@/lang';

import { FC, useMemo } from 'react';

import { OModal, OSetting } from '@obsidian-lib/native-react-components';

import { useSettingsContext } from '../../../../../core/SettingsContext';
import { useUnitsManagerContext } from '../../context/UnitsManagerContext';
import { UnitOptionsProps } from './types/interfaces';

export const ImageConfigOptionsModal: FC<UnitOptionsProps> = ({
    unitIndex,
    onClose,
    onChanges,
}) => {
    const { plugin } = useSettingsContext();
    const { units } = useUnitsManagerContext();
    const unit = useMemo(() => units[unitIndex], [unitIndex]);

    return (
        <OModal
            onClose={onClose}
            title={tf(
                t.settings.pages.images.presets.availableImageConfigs
                    .optionsModal.name,
                { name: unit.name }
            )}
        >
            <OSetting
                desc={
                    t.settings.pages.images.presets.availableImageConfigs
                        .optionsModal.desc
                }
            />

            <OSetting
                name={
                    t.settings.pages.images.presets.availableImageConfigs
                        .optionsModal.panels.header
                }
                heading={true}
            />

            {Object.entries(unit.panels).map(([panel, { on }]) => (
                <OSetting
                    name={panel
                        .charAt(0)
                        .toUpperCase()
                        .concat(panel.slice(1).toLowerCase())}
                    key={panel}
                >
                    <input
                        type={'checkbox'}
                        defaultChecked={on}
                        onChange={(event) => {
                            void (async () => {
                                const value = event.target.checked;
                                const oldUnits = JSON.parse(
                                    JSON.stringify(units)
                                ) as typeof units;
                                plugin.settings.$.units.configs[
                                    unitIndex
                                ].panels[panel].on = value;
                                await plugin.settings.save();
                                const state = value
                                    ? t.settings.pages.images.presets
                                          .availableImageConfigs.optionsModal
                                          .panels.states.on
                                    : t.settings.pages.images.presets
                                          .availableImageConfigs.optionsModal
                                          .panels.states.off;
                                onChanges(
                                    oldUnits,
                                    tf(
                                        t.settings.pages.images.presets
                                            .availableImageConfigs.optionsModal
                                            .panels.action,
                                        {
                                            state,
                                            panel,
                                            name: unit.name,
                                        }
                                    )
                                );
                            })();
                        }}
                    />
                </OSetting>
            ))}
        </OModal>
    );
};
