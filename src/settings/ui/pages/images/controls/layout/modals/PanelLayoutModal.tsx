import { t } from '@/lang';

import React from 'react';

import { OModal, OSetting } from '@obsidian-lib/native-react-components';

import PanelLayout from '../panel-layout/PanelLayout';

interface LayoutModalProps {
    onClose: () => void;
    title: string;
}

const PanelLayoutModal: React.FC<LayoutModalProps> = ({ onClose, title }) => (
        <OModal
            onClose={onClose}
            title={title}
        >
            <OSetting
                name={
                    t.settings.pages.images.layout.controlsLayout.modal
                        .panelConfig.name
                }
                desc={
                    t.settings.pages.images.layout.controlsLayout.modal
                        .panelConfig.desc
                }
                heading={true}
                noBorder={true}
            />
            <OSetting
                name={
                    t.settings.pages.images.layout.controlsLayout.modal
                        .availablePanels.name
                }
                desc={
                    t.settings.pages.images.layout.controlsLayout.modal
                        .availablePanels.desc
                }
                noBorder={true}
            />
            <OSetting
                name={
                    t.settings.pages.images.layout.controlsLayout.modal.howTo
                        .name
                }
                desc={
                    t.settings.pages.images.layout.controlsLayout.modal.howTo
                        .desc
                }
            />
            <PanelLayout />
        </OModal>
    );

export default PanelLayoutModal;
