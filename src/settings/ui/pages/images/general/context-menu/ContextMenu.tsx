import { useSettingsContext } from '@/settings/ui/core/SettingsContext';

import { FC } from 'react';

import { OSetting } from '@obsidian-lib/native-react-components';

const ContextMenu: FC = () => {
    const { plugin } = useSettingsContext();

    return (
        <>
            <OSetting
                name='Context menu'
                heading
            />
            <OSetting
                name='Show context menu for diagrams'
                desc='Toggle whether to show context menu for diagrams (svg and img generated from the codeblock)'
            >
                <input
                    type={'checkbox'}
                    defaultChecked={
                        plugin.settings.$.units.contextMenu.showForDiagrams
                    }
                    onChange={(e) => {
                        void (async () => {
                            plugin.settings.$.units.contextMenu.showForDiagrams =
                                e.target.checked;
                            await plugin.settings.save();
                        })();
                    }}
                />
            </OSetting>

            <OSetting
                name='Show context menu for other images'
                desc='Toggle whether to show context menu for other images elements (i.e. local or external)'
            >
                <input
                    type={'checkbox'}
                    defaultChecked={
                        plugin.settings.$.units.contextMenu.showForOtherImages
                    }
                    onChange={(e) => {
                        void (async () => {
                            plugin.settings.$.units.contextMenu.showForOtherImages =
                                e.target.checked;
                            await plugin.settings.save();
                        })();
                    }}
                />
            </OSetting>
        </>
    );
};

export default ContextMenu;
