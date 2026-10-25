import { t } from '@/lang';
import { Panels, PanelsConfig } from '@/settings/types/interfaces';
import { useSettingsContext } from '@/settings/ui/core/SettingsContext';

import React, { FC, useEffect, useMemo, useState } from 'react';

import { OSetting } from '@obsidian-lib/native-react-components';

import {
    FoldPanel,
    PanelControl,
    PanelPreview,
    PanelToggle,
    UnitPreview,
    UnitSetup,
} from './PanelLayout.styled';
import useDragDrop from './hooks/useDragDrop';

const PanelLayout: FC = () => {
    const { plugin } = useSettingsContext();
    const [panels] = useState(plugin.settings.$.panels.local.panels);

    const panelNames = useMemo(
        () => ({
            zoom: t.image.controlPanel.zoom.name,
            move: t.image.controlPanel.move.name,
            service: t.image.controlPanel.service.name,
            fold: t.image.controlPanel.fold.name,
        }),
        []
    );

    const [, setUpdateTrigger] = useState(false);
    const unitPreviewRef = React.useRef<HTMLDivElement>(null);

    const { draggedPanel, props } = useDragDrop({
        unitPreviewRef,
        panels,
    });

    useEffect(() => {
        const handler = () => {
            setUpdateTrigger((prev) => !prev);
        };

        plugin.settings.emitter.on(
            plugin.settings.$$.panels.local.panels.$all,
            handler
        );

        return () => {
            plugin.settings.emitter.off(
                plugin.settings.$$.panels.local.panels.$all,
                handler
            );
        };
    }, []);

    const togglePanelState = async (
        panelName: keyof Panels['local']['panels']
    ): Promise<void> => {
        panels[panelName].on = !panels[panelName].on;
        await plugin.settings.save();
    };

    return (
        <UnitSetup>
            <UnitPreview
                ref={unitPreviewRef}
                onDragOver={(e) => e.preventDefault()}
                {...props.container}
            >
                {Object.entries(panels).map(
                    ([name, config]) =>
                        config.on && (
                            <PanelPreview
                                key={name}
                                dragging={draggedPanel === name}
                                {...props.panel(name)}
                                style={{
                                    ...config.position,
                                }}
                            >
                                {panelNames[name as keyof typeof panelNames]}
                            </PanelPreview>
                        )
                )}
                <FoldPanel>{panelNames.fold}</FoldPanel>
            </UnitPreview>
            <PanelControl className={'control'}>
                {Object.entries(panels).map(([name, config]) => (
                    <PanelToggle key={name}>
                        <OSetting
                            name={panelNames[name as keyof typeof panelNames]}
                        >
                            <input
                                type='checkbox'
                                checked={config.on}
                                onChange={() =>
                                    void togglePanelState(
                                        name as keyof PanelsConfig
                                    )
                                }
                            />
                        </OSetting>
                    </PanelToggle>
                ))}
            </PanelControl>
        </UnitSetup>
    );
};

export default PanelLayout;
