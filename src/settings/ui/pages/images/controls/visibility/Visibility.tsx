import { t } from '@/lang';
import { PanelsTriggering } from '@/settings/types/interfaces';
import { useSettingsContext } from '@/settings/ui/core/SettingsContext';

import React, { useCallback, useMemo, useState } from 'react';

import { OSetting } from '@obsidian-lib/native-react-components';

const Visibility: React.FC = () => {
    const { plugin } = useSettingsContext();

    const [serviceOptionVisible, setServiceOptionVisible] = useState(
        plugin.settings.$.panels.global.triggering.mode !==
            PanelsTriggering.ALWAYS
    );

    const panelTriggeringOptionsTooltips: Record<PanelsTriggering, string> =
        useMemo(
            () => ({
                always: t.settings.pages.images.controls.visibility.tooltips
                    .always,
                hover: t.settings.pages.images.controls.visibility.tooltips
                    .hover,
                focus: t.settings.pages.images.controls.visibility.tooltips
                    .focus,
            }),
            [plugin]
        );

    const [dropdownQuestionTooltip, setDropdownQuestionTooltip] =
        useState<string>(
            panelTriggeringOptionsTooltips[
                plugin.settings.$.panels.global.triggering.mode
            ]
        );

    const extractTooltipDependsOnOption = useCallback(
        (select: HTMLSelectElement) => {
            const selectedValue = select.value as PanelsTriggering;
            const tooltip = panelTriggeringOptionsTooltips[selectedValue];
            setDropdownQuestionTooltip(tooltip);
        },
        [plugin]
    );
    return (
        <>
            <OSetting
                name={t.settings.pages.images.controls.visibility.name}
                desc={t.settings.pages.images.controls.visibility.desc}
            >
                <select
                    value={plugin.settings.$.panels.global.triggering.mode}
                    onChange={(e) => {
                        void (async () => {
                            const value = e.target.value as PanelsTriggering;
                            plugin.settings.$.panels.global.triggering.mode =
                                value;
                            setServiceOptionVisible(
                                value !== PanelsTriggering.ALWAYS
                            );
                            extractTooltipDependsOnOption(e.target);
                            await plugin.settings.save();
                        })();
                    }}
                >
                    <option value='always'>
                        {
                            t.settings.pages.images.controls.visibility.dropdown
                                .always
                        }
                    </option>
                    <option value='hover'>
                        {
                            t.settings.pages.images.controls.visibility.dropdown
                                .hover
                        }
                    </option>
                    <option value='focus'>
                        {
                            t.settings.pages.images.controls.visibility.dropdown
                                .focus
                        }
                    </option>
                </select>
                <button
                    aria-label={dropdownQuestionTooltip}
                    data-icon={'message-circle-question'}
                />
            </OSetting>

            {serviceOptionVisible && (
                <OSetting
                    name={t.settings.pages.images.controls.serviceIgnoring.name}
                    desc={t.settings.pages.images.controls.serviceIgnoring.desc}
                >
                    <input
                        type={'checkbox'}
                        defaultChecked={
                            plugin.settings.$.panels.global.triggering
                                .ignoreService
                        }
                        onChange={(e) => {
                            void (async () => {
                                plugin.settings.$.panels.global.triggering.ignoreService =
                                    e.target.checked;
                                await plugin.settings.save();
                            })();
                        }}
                    />
                </OSetting>
            )}
        </>
    );
};

export default Visibility;
