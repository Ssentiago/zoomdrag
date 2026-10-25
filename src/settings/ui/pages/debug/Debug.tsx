import { t, tf } from '@/lang';

import { FC, useCallback, useEffect, useState } from 'react';

import { OSetting } from '@obsidian-lib/native-react-components';

import { DebugLevel } from '../../../types/interfaces';
import { useSettingsContext } from '../../core/SettingsContext';

/**
 * The debug settings component.
 *
 * Provides settings for debugging, including logging enablement and level
 * selection, log export and copying, and clearing of log storage.
 *
 * @returns The debug settings component.
 */
const Debug: FC = () => {
    const { plugin } = useSettingsContext();

    const [storageData, setStorageData] = useState({
        storage: plugin.logger.getStorageUsage(),
        entries: plugin.logger.getAllLogs().length,
    });

    useEffect(() => {
        const handler = (payload: { storage: string; entries: number }) => {
            setStorageData(payload);
        };

        plugin.emitter.on('logs-changed', handler);

        return () => {
            plugin.emitter.off('logs-changed', handler);
        };
    }, [plugin]);

    const downloadLogs = useCallback(() => {
        const logs = plugin.logger.exportLogs();
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = createEl('a');
        link.href = url;
        link.download = 'izd-logs.txt';
        link.click();
        URL.revokeObjectURL(url);
    }, [plugin.logger]);

    const copyLogs = useCallback(async () => {
        const logString = plugin.logger.exportLogs();
        if (logString.trim() === '') {
            plugin.showNotice(
                t.settings.pages.debug.copyLogs.notice.logsNotFound
            );
            return;
        }
        await navigator.clipboard.writeText(logString);
        plugin.showNotice(t.settings.pages.debug.copyLogs.notice.successfully);
    }, []);

    const handleLinkButtonClick = useCallback(async () => {
        const systemInfo = JSON.stringify(
            plugin.logger.getShortSystemInfo(),
            null,
            2
        );
        const issueBody = encodeURIComponent(
            `## Issue Description\n` +
                `[Describe your issue here]\n\n` +
                `## Steps to Reproduce\n` +
                `1. [First step]\n` +
                `2. [Second step]\n\n` +
                `## System info\n` +
                `${systemInfo}\n\n`
        );
        const githubUrl =
            `https://github.com/Ssentiago/image-zoom-drag/issues/new?` +
            `title=${encodeURIComponent('[Bug Report] ')}&` +
            `labels=bug&` +
            `body=${issueBody}`;
        window.open(githubUrl, '_blank');
    }, []);

    const clearLogs = useCallback(async () => {
        plugin.logger.clearAllLogs();
        plugin.showNotice(
            t.settings.pages.debug.clearLogsStorage.notice.successfully
        );
    }, []);

    return (
        <>
            <OSetting
                name={t.settings.pages.debug.reportIssue.name}
                desc={t.settings.pages.debug.reportIssue.desc}
            >
                <button
                    aria-label={
                        t.settings.pages.debug.reportIssue.linkButtonTooltip
                    }
                    onClick={() => void handleLinkButtonClick()}
                    data-icon={'bug'}
                />
            </OSetting>

            <OSetting
                name={t.settings.pages.debug.enableLogging.name}
                desc={t.settings.pages.debug.enableLogging.desc}
            >
                <input
                    type='checkbox'
                    defaultChecked={plugin.settings.$.debug.enabled}
                    onChange={(e) => {
                        void (async () => {
                            plugin.settings.$.debug.enabled =
                                e.currentTarget.checked;
                            await plugin.settings.save();
                        })();
                    }}
                />
            </OSetting>

            <OSetting
                name={t.settings.pages.debug.logLevel.name}
                desc={t.settings.pages.debug.logLevel.desc}
            >
                <select
                    value={plugin.settings.$.debug.level}
                    onChange={(e) => {
                        void (async () => {
                            plugin.settings.$.debug.level = e.target
                                .value as DebugLevel;
                            await plugin.settings.save();
                        })();
                    }}
                >
                    <option value='none'>None</option>
                    <option value='error'>Error</option>
                    <option value='warn'>Warning</option>
                    <option value='info'>Info</option>
                    <option value='debug'>Debug</option>
                </select>
            </OSetting>

            <OSetting
                name={t.settings.pages.debug.aboutExportedLogs.name}
                desc={t.settings.pages.debug.aboutExportedLogs.desc}
            />

            <OSetting name={t.settings.pages.debug.exportLogs.name}>
                <button
                    aria-label={
                        t.settings.pages.debug.exportLogs.exportButtonTooltip
                    }
                    onClick={downloadLogs}
                    data-icon={'download'}
                />
            </OSetting>

            <OSetting name={t.settings.pages.debug.copyLogs.name}>
                <button
                    aria-label={
                        t.settings.pages.debug.copyLogs.copyButtonTooltip
                    }
                    onClick={() => void copyLogs()}
                    data-icon={'clipboard'}
                />
            </OSetting>

            <OSetting
                name={t.settings.pages.debug.clearLogsStorage.name}
                desc={tf(t.settings.pages.debug.clearLogsStorage.desc, {
                    storage: storageData.storage,
                    entries: storageData.entries.toString(),
                })}
            >
                <button
                    aria-label={
                        t.settings.pages.debug.clearLogsStorage
                            .clearButtonTooltip
                    }
                    onClick={() => void clearLogs()}
                    data-icon={'trash'}
                />
            </OSetting>
        </>
    );
};

export default Debug;
