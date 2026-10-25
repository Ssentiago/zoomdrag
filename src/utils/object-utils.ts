export function deepMerge(target: unknown, source: unknown): unknown {
    if (!source || typeof source !== 'object') return target;

    const result: Record<string, unknown> = {
        ...(target as Record<string, unknown>),
    };
    const src = source as Record<string, unknown>;

    for (const key in src) {
        if (
            src[key] &&
            typeof src[key] === 'object' &&
            !Array.isArray(src[key])
        ) {
            result[key] = deepMerge(result[key] ?? {}, src[key]);
        } else if (src[key] !== undefined) {
            result[key] = src[key];
        }
    }

    return result;
}
