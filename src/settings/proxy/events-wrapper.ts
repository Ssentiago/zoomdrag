

export function createEventsWrapper(obj: unknown, path: string[] = []): unknown {
    return new Proxy(obj, {
        get(target: Record<string, unknown>, key: string) {
            if (key === '$path') {
                return `settings.${path.join('.')}`;
            }

            const basePath =
                path.length > 0 ? `settings.${path.join('.')}` : 'settings';

            if (key === '$all' || key === '$deep') {
                return `${basePath}.**`;
            }

            if (key === '$children') {
                return `${basePath}.*`;
            }

            const value = target[key];

            if (typeof value !== 'object' || value === null) {
                const pathStr = `settings.${[...path, key].join('.')}`;
                return {
                    $path: pathStr,
                    $all: `${pathStr}.**`,
                    $deep: `${pathStr}.**`,
                    $children: `${pathStr}.*`,
                    toString: () => pathStr,
                    valueOf: () => pathStr,
                };
            }

            return createEventsWrapper(value, [...path, key]);
        },
    });
}
