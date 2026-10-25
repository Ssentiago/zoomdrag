import Exclusions from '@/settings/ui/pages/images/general/exclusions/Exclusions';

import React from 'react';

import ContextMenu from './context-menu/ContextMenu';
import Folding from './folding/Folding';
import Interactive from './interactive/Interactive';
import Size from './size/Size';

const General: React.FC = (): React.ReactElement => (
        <>
            <Interactive />
            <Size />
            <Folding />
            <ContextMenu />
            <Exclusions />
        </>
    );

export default General;
