import { ImageConfig } from '../../../../../../types/interfaces';
import { mode } from './definitions';

export interface ModeState {
    mode: mode;
    index: number;
    data?: {
        [key: string]: unknown;
    };
}

export interface UnitItemProps {
    unit: ImageConfig;
    index: number;
    modeState: ModeState;
    setModeState: (modeState: ModeState) => void;
}
