import { PartialLocale } from '@/lang/t/types/definitions';
import { LocaleSchema } from '@/lang/types/interfaces';

import { moment } from '@/utils/moment';

import en from '../locale/en/flat.json';

export const locales: Record<string, LocaleSchema> = {
    en: en as unknown as LocaleSchema,
};

export function initLocale(): LocaleSchema | PartialLocale {
    const localeKey = moment.locale();
    const lang = localeKey in locales ? localeKey : 'en';

    return locales[lang];
}

const currentLocale: LocaleSchema | PartialLocale = initLocale();

export function t(key: string) {
    return (
        currentLocale[key as keyof typeof currentLocale] ??
        en[key as keyof typeof en] ??
        `[missing: ${key}]`
    );
}
