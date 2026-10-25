import { t } from '@/lang';

import React, { FC } from 'react';

import { OSetting } from '@obsidian-lib/native-react-components';

import { useSettingsContext } from '../../../../core/SettingsContext';

const Exclusions: FC = (): React.ReactElement => {
    const { plugin } = useSettingsContext();
    return (
        <>
            <OSetting
                name={
                    t.settings.pages.images.general.exclusions.patterns.header
                }
                heading
            />

            <OSetting
                name={t.settings.pages.images.general.exclusions.patterns.name}
                desc={t.settings.pages.images.general.exclusions.patterns.desc}
                noBorder={true}
            >
                <textarea
                    defaultValue={plugin.settings.$.units.exclusions.patterns}
                    rows={6}
                    onChange={(e) => {
                        void (async () => {
                            plugin.settings.$.units.exclusions.patterns =
                                e.target.value;
                            await plugin.settings.save();
                        })();
                    }}
                />
            </OSetting>
        </>
    );
};

export default Exclusions;
