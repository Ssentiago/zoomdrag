import IzdPlugin from '@/core/izd-plugin';
import { ShortSystemInfo, SystemInfo } from '@/core/services/types/interfaces';

import { moment, normalizePath, Platform } from 'obsidian';

export default class Logger {
    private readonly maxEntries = 2000;
    private readonly storageKey: string;
    private isStorageAvailable = true;
    logsDir!: string;

    constructor(public plugin: IzdPlugin) {
        this.storageKey = `${plugin.manifest.id}-logs`;
        this.checkStorageAvailability();
    }

    /**
     * Initializes the logger by writing system information if the debug setting is enabled.
     */
    async init(): Promise<void> {
        await this.ensureLogsDirExists();
        this.plugin.settings.$.debug.enabled && (await this.writeSystemInfo());
    }

    /**
     * Saves log content to a file in the plugin's log directory.
     *
     * This function ensures that the logs directory exists within the plugin directory,
     * creates it if necessary, and then writes the provided log content to a JSON file
     * named with the current timestamp. After saving the logs, it rotates old log files
     * to maintain a clean log directory.
     *
     * @param content The log content to save.
     * @throws An error if the plugin directory is not found or if there is an issue writing the logs.
     */
    async saveLogsToFile(content: string): Promise<void> {
        try {
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            const filename = `logs-${now}.json`;
            const filepath = normalizePath(`${this.logsDir}/${filename}`);

            await this.plugin.app.vault.adapter.write(filepath, content);

            await this.rotateLogFiles(this.logsDir);
        } catch (error) {
            console.error('Zoomdrag: Error in the file:', error);
        }
    }

    async ensureLogsDirExists(): Promise<void> {
        const pluginDir = this.plugin.manifest.dir;
        if (pluginDir === undefined) {
            throw new Error(
                `Zoomdrag: It was not possible to get the way to the plugin. Path:${pluginDir}`
            );
        }
        this.logsDir = normalizePath(`${pluginDir}/logs`);
        const exists = await this.plugin.app.vault.adapter.exists(this.logsDir);
        !exists && (await this.plugin.app.vault.adapter.mkdir(this.logsDir));
    }

    /**
     * Rotates log files in the specified directory.
     * @param logsDir The directory in which log files are stored.
     * @returns A promise that resolves when the log files have been rotated.
     *
     * This function removes any log files that are older than 7 days.
     */
    private async rotateLogFiles(logsDir: string): Promise<void> {
        try {
            const files = await this.plugin.app.vault.adapter.list(logsDir);
            const now = moment().unix() * 1000;
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

            for (const file of files.files) {
                if (!file.endsWith('.json')) {
                    continue;
                }

                const filePath = `${logsDir}/${file}`;
                const stat = await this.plugin.app.vault.adapter.stat(filePath);

                if (stat && now - stat.mtime > maxAge) {
                    await this.plugin.app.vault.adapter.remove(filePath);
                    console.log(
                        `Zoomdrag: Remove the old log-file${file}`
                    );
                }
            }
        } catch (error) {
            console.error('Zoomdrag: Log Rotation Error:', error);
        }
    }

    /**
     * Returns the version of Obsidian as a string, or 'unknown' if it cannot be determined.
     *
     * The version is extracted from the title of the current page, which is assumed to contain
     * the string "Obsidian vX.Y.Z" where X.Y.Z is the version number.
     * @returns The version of Obsidian as a string, or 'unknown' if it cannot be determined.
     */
    getObsidianVersion(): string {
        const title = document.title;
        const match = title.match(/Obsidian v([\d.]+)/);
        return match ? match[1] : 'unknown';
    }

    private async writeSystemInfo(): Promise<void> {
        const systemInfo = this.getSystemInfo();
        this.addLogEntry(systemInfo);
    }

    getSystemInfo(): SystemInfo {
        return {
            timestamp: moment().toISOString(),
            session_start: true,
            obsidian: {
                version: this.getObsidianVersion(),
                title: document.title,
                enabledPlugins_count:
                    this.plugin.app.plugins.enabledPlugins.size,
                enabledPlugins_list: Array.from(
                    this.plugin.app.plugins.enabledPlugins
                ),
                vault_name: this.plugin.app.vault.getName(),
                is_mobile: Platform.isMobile,
                is_desktop: Platform.isDesktopApp,
            },
            system: {
                platform: this.getPlatformInfo(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                screen_resolution: `${screen.width}x${screen.height}`,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                online_status: navigator.onLine,
                cpu_cores: navigator.hardwareConcurrency || 'unknown',
                device_memory: (navigator as any).deviceMemory || 'unknown',
                connection_type:
                    (navigator as any).connection?.effectiveType || 'unknown',
            },
            plugin: {
                name: this.plugin.manifest.name,
                version: this.plugin.manifest.version,
                minAppVersion: this.plugin.manifest.minAppVersion,
                id: this.plugin.manifest.id,
                author: this.plugin.manifest.author,
                description: this.plugin.manifest.description,
            },
            performance: {
                memory_used:
                    (performance as any).memory?.usedJSHeapSize || 'unknown',
                memory_total:
                    (performance as any).memory?.totalJSHeapSize || 'unknown',
                memory_limit:
                    (performance as any).memory?.jsHeapSizeLimit || 'unknown',
                load_time: performance.now(),
            },
            storage: {
                localStorage_usage: this.getStorageUsage(),
            },
        };
    }

    getShortSystemInfo(): ShortSystemInfo {
        return {
            timestamp: moment().toISOString(),
            obsidian: {
                version: this.getObsidianVersion(),
                vault_name: this.plugin.app.vault.getName(),
                is_mobile: Platform.isMobile,
            },
            system: {
                platform: this.getPlatformInfo(),
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            plugin: {
                name: this.plugin.manifest.name,
                version: this.plugin.manifest.version,
                id: this.plugin.manifest.id,
            },
        };
    }

    /**
     * Get the platform information.
     *
     * This function uses the `userAgentData` API if available, otherwise it falls back to the
     * `navigator.platform` property. If both of them are not available, it returns 'unknown'.
     *
     * @returns {string} The platform name, or 'unknown' if it cannot be determined.
     */
    private getPlatformInfo(): string {
        if ('userAgentData' in navigator) {
            const uaData = (navigator as any).userAgentData;
            return uaData.platform ?? 'unknown';
        }

        return navigator.platform ?? 'unknown';
    }

    /**
     * Calculate the current usage of local storage by logs.
     *
     * This function retrieves the logs from local storage using the defined storage key
     * and calculates their memory usage in kilobytes. If no logs are found, it returns '0 B'.
     * In case of an error during retrieval, it returns 'unknown'.
     *
     * @returns {string} The size of the logs in local storage formatted as a string in KB,
     * or '0 B' if no logs are stored, or 'unknown' if an error occurs.
     */
    getStorageUsage(): string {
        try {
            const logs = localStorage.getItem(this.storageKey);
            if (!logs) {
                return '0 B';
            }

            const bytes = logs.length + this.storageKey.length;
            return `${(bytes / 1024).toFixed(2)} KB`;
        } catch {
            return 'unknown';
        }
    }
    /**
     * Check if local storage is available.
     *
     * This function checks if local storage is available by attempting to set and remove an item.
     * If the operation fails, `isStorageAvailable` is set to `false` and a warning is logged.
     */
    private checkStorageAvailability(): void {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch {
            this.isStorageAvailable = false;
            console.warn('Zoomdrag: Localstorage is not available');
        }
    }

    /**
     * Add a log entry to the log storage.
     *
     * If the log storage is not available, the log entry is discarded.
     *
     * @param {any} logEntry The log entry to add.
     */
    private addLogEntry(logEntry: any): void {
        if (!this.isStorageAvailable) {
            return;
        }

        try {
            const logs = this.getAllLogs();
            logs.push(logEntry);

            if (logs.length > this.maxEntries) {
                logs.splice(0, logs.length - this.maxEntries);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(logs));

            this.plugin.emitter.emit('logs-changed', {
                storage: this.getStorageUsage(),
                entries: this.getAllLogs().length,
            });
        } catch (error) {
            console.error('Logger: Ошибка записи в localStorage:', error);
            this.isStorageAvailable = false;
        }
    }

    /**
     * Returns all stored logs as an array of objects.
     *
     * The array is empty if no logs are available.
     *
     * @returns {any[]} An array of log objects, or an empty array if no logs are available.
     */
    getAllLogs(): any[] {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Logs a message with the specified level.
     *
     * If the `debug.enabled` setting is `false`, the message is discarded.
     *
     * @param {string} level - The severity level of the message (e.g., 'debug', 'info', 'warn', 'error').
     * @param {string} message - The message to log.
     */
    private log(level: string, message: string, context?: any): void {
        if (!this.plugin.settings.$.debug.enabled) {
            return;
        }
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            context: context,
        };

        this.addLogEntry(logEntry);
    }

    /**
     * Determines if a message should be logged based on its level.
     *
     * This function compares the provided message level with the current
     * logging level set in the plugin's settings. It returns `true` if
     * the message level is equal to or more severe than the current logging
     * level, allowing the message to be logged.
     *
     * @param messageLevel - The severity level of the message (e.g., 'debug', 'info', 'warn', 'error').
     * @returns `true` if the message should be logged, `false` otherwise.
     */
    private shouldLog(messageLevel: string): boolean {
        const levels = ['none', 'debug', 'info', 'warn', 'error'];
        const currentLevel = this.plugin.settings.$.debug.level;

        if (currentLevel === 'none') {
            return false;
        }

        const messageLevelIndex = levels.indexOf(messageLevel.toLowerCase());
        const currentLevelIndex = levels.indexOf(currentLevel);

        return messageLevelIndex >= currentLevelIndex;
    }

    debug(message: string, context?: any): void {
        if (!this.shouldLog('debug')) {
            return;
        }
        this.log('DEBUG', message, context);
    }

    info(message: string, context?: any): void {
        if (!this.shouldLog('info')) {
            return;
        }
        this.log('INFO', message, context);
    }

    warn(message: string, context?: any): void {
        if (!this.shouldLog('warn')) {
            return;
        }
        this.log('WARNING', message, context);
    }

    error(message: string, context?: any): void {
        if (!this.shouldLog('error')) {
            return;
        }

        this.log('ERROR', message, context);
    }

    /**
     * Exports all stored logs as a formatted string.
     *
     * The exported string includes both system information logs
     * and regular logs. System information logs are identified
     * by the presence of a `session_start` property and are
     * displayed under the "=== SYSTEM INFO ===" section.
     * Regular logs are displayed under the "=== LOGS ===" section,
     * each prefixed by a timestamp and log level.
     *
     * @returns A formatted string containing system information
     * and regular logs. Returns an empty string if no logs are available.
     */
    exportLogs(): string {
        const logs = this.getAllLogs();
        if (logs.length === 0) {
            return '';
        }
        const systemInfo = logs.filter((log) => log.session_start);
        const regularLogs = logs.filter((log) => !log.session_start);

        let result = '=== SYSTEM INFO ===\n';
        systemInfo.forEach((info) => {
            result += JSON.stringify(info, null, 2) + '\n\n';
        });

        result += '\n=== LOGS ===\n';
        regularLogs.forEach((log) => {
            const date = new Date(log.timestamp);
            const time = date.toLocaleTimeString();
            const ctx = log.context;
            const location = ctx?.file
                ? `${ctx.file}:${ctx.lineNumber}${ctx.functionName ? ` (${ctx.functionName})` : ''}`
                : 'unknown';

            result += `[${time}] ${log.level.toUpperCase().padEnd(5)} | ${location}\n`;
            result += `  ${log.message}\n`;

            const extraContext = { ...ctx };
            delete extraContext.file;
            delete extraContext.lineNumber;
            delete extraContext.columnNumber;
            delete extraContext.functionName;

            if (Object.keys(extraContext).length > 0) {
                result += `  Context: ${JSON.stringify(extraContext)}\n`;
            }
            result += '\n';
        });

        return result;
    }
    /**
     * Clears all stored logs from local storage.
     *
     * This function removes the log entries associated with the
     * current storage key from the local storage. It effectively
     * deletes all logs that have been stored, resetting the log
     * storage to an empty state.
     */
    clearAllLogs(): void {
        localStorage.removeItem(this.storageKey);
        this.plugin.emitter.emit('logs-changed', {
            storage: this.getStorageUsage(),
            entries: this.getAllLogs().length,
        });
    }
}
