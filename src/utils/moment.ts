import { moment as obsidianMoment } from 'obsidian';
import type momentType from 'moment';

/**
 * Obsidian types export `moment` as a namespace (`import * as Moment`), which is not
 * callable. Runtime value from `obsidian` is the usual moment function.
 */
export const moment: typeof momentType =
    obsidianMoment as unknown as typeof momentType;
