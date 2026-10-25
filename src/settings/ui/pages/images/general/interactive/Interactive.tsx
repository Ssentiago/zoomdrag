import { t } from '@/lang';

import { FC } from 'react';

import { OSetting } from '@obsidian-lib/native-react-components';

import { useSettingsContext } from '../../../../core/SettingsContext';

const Interactive: FC = () => {
    const { plugin } = useSettingsContext();

    return (
        <>
            <OSetting
                name={t.settings.pages.images.general.interactive.header}
                heading
            />

            <OSetting
                name={
                    t.settings.pages.images.general.interactive.pickerMode.name
                }
                desc={
                    t.settings.pages.images.general.interactive.pickerMode.desc
                }
            >
                <input
                    type={'checkbox'}
                    defaultChecked={
                        plugin.settings.$.units.interactivity.picker.enabled
                    }
                    onChange={(e) => {
                        void (async () => {
                            plugin.settings.$.units.interactivity.picker.enabled =
                                e.target.checked;
                            await plugin.settings.save();
                        })();
                    }}
                />
            </OSetting>

            <OSetting
                name={
                    t.settings.pages.images.general.interactive.autoDetect.name
                }
                desc={
                    t.settings.pages.images.general.interactive.autoDetect.desc
                }
            >
                <input
                    type={'checkbox'}
                    defaultChecked={
                        plugin.settings.$.units.interactivity.markdown
                            .autoDetect
                    }
                    onChange={(e) => {
                        void (async () => {
                            const value = e.target.checked;
                            plugin.settings.$.units.interactivity.markdown.autoDetect =
                                value;
                            await plugin.settings.save();
                        })();
                    }}
                />
            </OSetting>
        </>
    );
};

export default Interactive;
