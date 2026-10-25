import { t } from '@/lang';
import { useSettingsContext } from '@/settings/ui/core/SettingsContext';

import { FC, useCallback } from 'react';

import { OButton } from '@obsidian-lib/native-react-components';

const ResetSettings: FC = () => {
    const { plugin, forceReload } = useSettingsContext();

    const resetAction = useCallback(async () => {
        await plugin.settings.reset();
        plugin.settings.emitter.emit('settings-reset', {
            eventName: 'settings-reset',
            oldValue: undefined,
            newValue: undefined,
        });
        forceReload();
        plugin.showNotice(t.settings.toolbar.reset.notice);
    }, [plugin, forceReload]);

    return (
        <OButton
            variant='warning'
            label='Reset'
            tooltip={t.settings.toolbar.reset.tooltip}
            onClick={resetAction}
        />
    );
};

export default ResetSettings;
