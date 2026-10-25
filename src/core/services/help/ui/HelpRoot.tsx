import Help from '@/core/services/help/help';
import HelpContent from '@/core/services/help/ui/HelpContent';

import { FC } from 'react';

export interface HelpRootProps {
    help: Help;
    mode: 'minimal' | 'full';
    onClose: () => void;
}

const HelpRoot: FC<HelpRootProps> = ({ mode, onClose, help }) => (
        <HelpContent
            help={help}
            mode={mode}
            onClose={onClose}
        />
    );

export default HelpRoot;
