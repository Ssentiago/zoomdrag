import About from '@/settings/ui/pages/about/About';
import Controls from '@/settings/ui/pages/images/controls/Controls';
import Debug from '@/settings/ui/pages/debug/Debug';
import General from '@/settings/ui/pages/images/general/General';
import Presets from '@/settings/ui/pages/images/presets/Presets';
import { UnitsManagerProvider } from '@/settings/ui/pages/images/presets/context/UnitsManagerContext';
import { useSettingsContext } from '@/settings/ui/core/SettingsContext';

import { FC } from 'react';

import {
    OSetting,
    OSettingDrillDown,
    OSettingGroup,
    SettingRoot,
} from '@obsidian-lib/native-react-components';

import ResetSettings from './ResetSettings';

const SettingsPage: FC = () => {
    const { reloadCount } = useSettingsContext();

    return (
        <SettingRoot key={reloadCount}>
            <OSettingGroup heading='Images'>
                <OSettingDrillDown
                    name='General'
                    desc='Interactivity, size, folding, context menu and exclusions'
                >
                    <General />
                </OSettingDrillDown>

                <OSettingDrillDown
                    name='Presets'
                    desc='Image presets that override default settings'
                >
                    <UnitsManagerProvider>
                        <Presets />
                    </UnitsManagerProvider>
                </OSettingDrillDown>

                <OSettingDrillDown
                    name='Controls'
                    desc='Visibility and layout of image controls'
                >
                    <Controls />
                </OSettingDrillDown>
            </OSettingGroup>

            <OSettingGroup heading='Plugin'>
                <OSettingDrillDown
                    name='Debug'
                    desc='Logging and troubleshooting'
                >
                    <Debug />
                </OSettingDrillDown>

                <OSettingDrillDown
                    name='About'
                    desc='Links, help and credits'
                >
                    <About />
                </OSettingDrillDown>
            </OSettingGroup>

            <OSettingGroup heading='Maintenance'>
                <OSetting
                    name='Reset settings'
                    desc='Restore all settings to their defaults'
                >
                    <ResetSettings />
                </OSetting>
            </OSettingGroup>
        </SettingRoot>
    );
};

export default SettingsPage;
