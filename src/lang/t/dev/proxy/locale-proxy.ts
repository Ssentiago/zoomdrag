import { LocaleWrapper } from '@/lang/t/dev/proxy/types/definitions';

export class LocaleProxy<T extends object> {
    constructor(
        private readonly currentLocale: T,
        private readonly fallbackLocale: T
    ) {}

    createProxy(path: string[] = []): LocaleWrapper<T> {
        return new Proxy({}, {
            get: (_, key: string) => {
                const fullPath = [...path, key];
                const val = this.getValue(fullPath, this.currentLocale);

                if (this.isEmpty(val)) {
                    return this.handleMissing(fullPath);
                }

                if (this.isObject(val)) {
                    return this.createProxy(fullPath);
                }

                return val;
            },
        });
    }

    private getValue(path: string[], locale: unknown): unknown {
        return path.reduce((acc, key) => acc?.[key], locale);
    }

    private isEmpty(val: unknown): boolean {
        return (
            val === undefined ||
            val === null ||
            val === '' ||
            (Array.isArray(val) && val.length === 0)
        );
    }

    private isObject(val: unknown): boolean {
        return val !== null && typeof val === 'object' && !Array.isArray(val);
    }

    private handleMissing(path: string[]): unknown {
        const fallbackVal = this.getValue(path, this.fallbackLocale);

        if (!this.isEmpty(fallbackVal)) {
            return this.isObject(fallbackVal)
                ? this.createProxy(path)
                : fallbackVal;
        }

        if (process.env.NODE_ENV === 'development') {
            console.warn(`Missing locale key: ${path.join('.')}`);
        }

        return `[missing: ${path.join('.')}]`;
    }
}
