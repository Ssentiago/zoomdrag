import DOMWatcher from '@/core/services/dom-watcher/DOMWatcher';
import LeafIndex from '@/core/services/leaf-index/leaf-index';
import UserState from '@/core/services/user-state/user-state';
import { tPromise } from '@/lang';
import IntegratedMode from '@/modes/integrated-mode/integrated-mode';
import PickerMode from '@/modes/picker-mode/picker-mode';
import PopupMode from '@/modes/popup-mode/popup-mode';
import Settings from '@/settings/settings';
import { SettingsTab } from '@/settings/settings-tab';

import EventEmitter2 from 'eventemitter2';
import { Notice, Plugin } from 'obsidian';

import Help from './services/help/help';
import Logger from './services/logger/logger';

export default class IzdPlugin extends Plugin {
    noticeEl?: HTMLElement;

    settings!: Settings;
    logger!: Logger;
    emitter!: EventEmitter2;
    leafIndex!: LeafIndex;

    pickerMode!: PickerMode;
    integratedMode!: IntegratedMode;
    popupMode!: PopupMode;
    domWatcher!: DOMWatcher;
    userState!: UserState;
    help!: Help;

    onload(): void {
        void (async () => {
            if (process.env.NODE_ENV === 'development') {
                (window as unknown).plugin = this;
            }

            await this.initialize();

            this.logger.info('Plugin loaded successfully');
        })();
    }

    onunload(): void {
        super.onunload();

        this.emitter.removeAllListeners();
        this.logger.info('Plugin unloaded successfully');
    }

    private async initialize(): Promise<void> {
        await this.initializeCore();
        await this.initializeServices();
        await this.initializeUI();
    }

    private async initializeCore(): Promise<void> {
        await tPromise;

        this.settings = new Settings(this);
        this.addChild(this.settings);

        await this.settings.load();

        this.addSettingTab(new SettingsTab(this.app, this));

        this.emitter = new EventEmitter2({
            wildcard: true,
            delimiter: '.',
        });
    }

    /**
     * Initialize plugin UI components
     *
     * Integrated mode: responsible for image processing inside the Obsidian DOM (Markdown View
     * Popup mode: renders images inside the external React DOM (Modal Window)
     * Picker mode: it gives the user an ability to switch the image to Popup mode or Integrated. Delegates initialization
     */
    private async initializeUI(): Promise<void> {
        this.pickerMode = new PickerMode(this);
        this.integratedMode = new IntegratedMode(this);
        this.popupMode = new PopupMode(this);

        this.pickerMode.initialize();
        this.integratedMode.initialize();
        this.popupMode.initialize();

        this.addChild(this.pickerMode);
        this.addChild(this.integratedMode);
        this.addChild(this.popupMode);
    }

    private async initializeServices(): Promise<void> {
        this.leafIndex = new LeafIndex(this);
        this.addChild(this.leafIndex);

        this.domWatcher = new DOMWatcher();
        this.addChild(this.domWatcher);

        this.logger = new Logger(this);
        await this.logger.init();

        this.userState = new UserState(this);
        await this.userState.initialize();

        this.help = new Help(this);
        this.addChild(this.help);
    }

    /**
     * An alias for `new Notice` element creating.
     *
     * Saves the message object, deletes the old one on a call to avoid message spam
     *
     * @param message - The notice message to be displayed
     * @param duration - The duration for which the notice should be displayed. If undefined, that message will be displayed until the user interacts with it explicitly
     * @returns void
     */
    showNotice(message: string, duration?: number): void {
        this.noticeEl?.remove();
        const notice = new Notice(message, duration);
        this.noticeEl = notice.containerEl;
    }

    /**
     * Allows to create interactive notifications
     *
     * @param message - The notice message to be displayed
     * @param callback - the callback that will be executed on notice clicks
     * @param duration - The duration for which the notice should be displayed. If undefined, that message will be displayed until the user interacts with it explicitly
     *
     */
    showInteractiveNotice(
        message: string,
        callback: () => void | Promise<void>,
        duration?: number
    ): void {
        this.showNotice(message, duration);
        this.noticeEl?.addEventListener('click', () => void callback(), { once: true });
    }
}
