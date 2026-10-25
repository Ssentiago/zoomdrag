import { Component } from 'obsidian';

type MutationCondition = (mutation: MutationRecord) => boolean;
type MutationCallback = (mutation: MutationRecord) => void | Promise<void>;

export default class DOMWatcher extends Component {
    observer: MutationObserver | null = null;

    private readonly subscribers = new Map<
        MutationCondition,
        MutationCallback
    >();

    constructor() {
        super();
        this.load();
        this.enable();
    }

    private enable(): void {
        this.observer = new MutationObserver((mutations) => {
            void (async () => {
                for (const mutation of mutations) {
                    await this.processMutation(mutation);
                }
            })();
        });
        this.observer.observe(document.body, {
            childList: true, // Add/removal of children
            subtree: true, // monitor all subtree
            attributes: true, // changes in attributes
            attributeOldValue: true,
        });
    }

    private async processMutation(mutation: MutationRecord): Promise<void> {
        for (const [condition, callback] of this.subscribers) {
            if (condition(mutation)) {
                await callback(mutation);
            }
        }
    }

    onunload(): void {
        super.onunload();
        this.observer?.disconnect();
        this.subscribers.clear();
    }

    subscribe(condition: MutationCondition, callback: MutationCallback): void {
        this.subscribers.set(condition, callback);
    }
    unsubscribe(condition: MutationCondition): void {
        this.subscribers.delete(condition);
    }
}
