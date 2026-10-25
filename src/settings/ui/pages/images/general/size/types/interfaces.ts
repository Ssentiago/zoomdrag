import { DefaultSettings } from '../../../../../../types/interfaces';
import { ComponentType } from './constants';

export interface DimensionsOptionProps {
    type: ComponentType;
    initialOptions:
        | DefaultSettings['units']['size']['folded']
         ;
    border?: boolean;
}
