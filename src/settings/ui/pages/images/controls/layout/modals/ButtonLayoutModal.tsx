import { t } from '@/lang';
import { useSettingsContext } from '@/settings/ui/core/SettingsContext';

import React, { useEffect, useRef, useState } from 'react';

import { OModal, OSetting } from '@obsidian-lib/native-react-components';

interface ButtonManagementModalProps {
    onClose: () => void;
    title: string;
}

const ButtonLayoutModal: React.FC<ButtonManagementModalProps> = ({
    onClose,
    title,
}) => {
    const { plugin } = useSettingsContext();

    const [reload, setReload] = useState(false);

    const buttonData = React.useMemo(() => {
        const { zoom, move, service } = plugin.settings.$.panels.local.panels;

        return {
            zoom: [
                {
                    tooltip: t.image.controlPanel.zoom.in,
                    icon: 'zoom-in',
                    getValue: () => zoom.buttons.in,
                    setValue: (v: boolean) => (zoom.buttons.in = v),
                },
                {
                    tooltip: t.image.controlPanel.zoom.out,
                    icon: 'zoom-out',
                    getValue: () => zoom.buttons.out,
                    setValue: (v: boolean) => (zoom.buttons.out = v),
                },
                {
                    tooltip: t.image.controlPanel.zoom.reset,
                    icon: 'refresh-cw',
                    getValue: () => zoom.buttons.reset,
                    setValue: (v: boolean) => (zoom.buttons.reset = v),
                },
            ],
            move: [
                {
                    tooltip: t.image.controlPanel.move.up,
                    icon: 'arrow-up',
                    getValue: () => move.buttons.up,
                    setValue: (v: boolean) => (move.buttons.up = v),
                },
                {
                    tooltip: t.image.controlPanel.move.down,
                    icon: 'arrow-down',
                    getValue: () => move.buttons.down,
                    setValue: (v: boolean) => (move.buttons.down = v),
                },
                {
                    tooltip: t.image.controlPanel.move.left,
                    icon: 'arrow-left',
                    getValue: () => move.buttons.left,
                    setValue: (v: boolean) => (move.buttons.left = v),
                },
                {
                    tooltip: t.image.controlPanel.move.right,
                    icon: 'arrow-right',
                    getValue: () => move.buttons.right,
                    setValue: (v: boolean) => (move.buttons.right = v),
                },
                {
                    tooltip: t.image.controlPanel.move.upRight,
                    icon: 'arrow-up-right',
                    getValue: () => move.buttons.upRight,
                    setValue: (v: boolean) => (move.buttons.upRight = v),
                },
                {
                    tooltip: t.image.controlPanel.move.downRight,
                    icon: 'arrow-down-right',
                    getValue: () => move.buttons.downRight,
                    setValue: (v: boolean) => (move.buttons.downRight = v),
                },
                {
                    tooltip: t.image.controlPanel.move.upLeft,
                    icon: 'arrow-up-left',
                    getValue: () => move.buttons.upLeft,
                    setValue: (v: boolean) => (move.buttons.upLeft = v),
                },
                {
                    tooltip: t.image.controlPanel.move.downLeft,
                    icon: 'arrow-down-left',
                    getValue: () => move.buttons.downLeft,
                    setValue: (v: boolean) => (move.buttons.downLeft = v),
                },
            ],
            service: [
                {
                    tooltip: t.image.controlPanel.service.hide.name,
                    icon: 'eye',
                    getValue: () => service.buttons.hide,
                    setValue: (v: boolean) => (service.buttons.hide = v),
                },
                {
                    tooltip: t.image.controlPanel.service.fullscreen.name,
                    icon: 'fullscreen',
                    getValue: () => service.buttons.fullscreen,
                    setValue: (v: boolean) => (service.buttons.fullscreen = v),
                },
            ],
        };
    }, [plugin, reload]);

    const panelNames = {
        zoom: t.image.controlPanel.zoom.name,
        move: t.image.controlPanel.move.name,
        service: t.image.controlPanel.service.name,
    };

    const isApplyingPreset = useRef(false);

    const presets = {
        minimal: {
            zoom: { in: true, out: true, reset: false },
            move: {
                up: false,
                down: false,
                left: false,
                right: false,
                upRight: false,
                downRight: false,
                upLeft: false,
                downLeft: false,
            },
            service: { hide: true, fullscreen: false },
        },
        full: {
            zoom: { in: true, out: true, reset: true },
            move: {
                up: true,
                down: true,
                left: true,
                right: true,
                upRight: true,
                downRight: true,
                upLeft: true,
                downLeft: true,
            },
            service: { hide: true, fullscreen: true },
        },
        presentation: {
            zoom: { in: true, out: true, reset: true },
            move: {
                up: false,
                down: false,
                left: false,
                right: false,
                upRight: false,
                downRight: false,
                upLeft: false,
                downLeft: false,
            },
            service: { hide: true, fullscreen: true },
        },
    };

    useEffect(() => {
        const handler = () => {
            void (async () => {
                if (isApplyingPreset.current) {
                    return;
                }

                plugin.settings.$.panels.local.preset = 'none';

                await plugin.settings.save();

                setReload((prev) => !prev);
            })();
        };

        plugin.settings.emitter.on(
            `${plugin.settings.$$.panels.local.panels.$all}`,
            handler
        );

        return () => {
            plugin.settings.emitter.off(
                `${plugin.settings.$$.panels.local.panels.$all}`,
                handler
            );
        };
    }, [plugin, isApplyingPreset]);

    const applyPreset = async (preset: keyof typeof presets) => {
        isApplyingPreset.current = true;

        const { zoom, move, service } = plugin.settings.$.panels.local.panels;
        const config = presets[preset];

        Object.assign(zoom.buttons, config.zoom);
        Object.assign(move.buttons, config.move);
        Object.assign(service.buttons, config.service);

        plugin.settings.$.panels.local.preset = preset;
        await plugin.settings.save();
        isApplyingPreset.current = false;
        setReload((prev) => !prev);
    };

    return (
        <OModal
            title={title}
            onClose={onClose}
        >
            <OSetting
                name={
                    t.settings.pages.images.layout.buttonsLayout.modal.preset
                        .name
                }
            >
                <button
                    className={
                        plugin.settings.$.panels.local.preset === 'minimal'
                            ? 'button-active'
                            : ''
                    }
                    onClick={() => void applyPreset('minimal')}
                >
                    {
                        t.settings.pages.images.layout.buttonsLayout.modal
                            .preset.buttons.minimal
                    }
                </button>

                <button
                    className={
                        plugin.settings.$.panels.local.preset === 'full'
                            ? 'button-active'
                            : ''
                    }
                    onClick={() => void applyPreset('full')}
                >
                    {
                        t.settings.pages.images.layout.buttonsLayout.modal
                            .preset.buttons.full
                    }
                </button>

                <button
                    className={
                        plugin.settings.$.panels.local.preset === 'presentation'
                            ? 'button-active'
                            : ''
                    }
                    onClick={() => void applyPreset('presentation')}
                >
                    {
                        t.settings.pages.images.layout.buttonsLayout.modal
                            .preset.buttons.presentation
                    }
                </button>
            </OSetting>

            {Object.entries(buttonData).map(([panel, panelData]) => (
                <React.Fragment key={panel}>
                    <OSetting
                        name={panelNames[panel as keyof typeof panelNames]}
                        heading
                    />
                    {panelData.map(
                        ({ tooltip, icon, getValue, setValue }, index) => (
                            <OSetting
                                key={tooltip}
                                name={tooltip}
                                noBorder={index !== panelData.length - 1}
                            >
                                <button
                                    aria-label={tooltip}
                                    data-icon={icon}
                                />
                                <input
                                    type={'checkbox'}
                                    checked={getValue()}
                                    onChange={(e) => {
                                        setValue(e.target.checked);
                                    }}
                                />
                            </OSetting>
                        )
                    )}
                </React.Fragment>
            ))}
        </OModal>
    );
};

export default ButtonLayoutModal;
