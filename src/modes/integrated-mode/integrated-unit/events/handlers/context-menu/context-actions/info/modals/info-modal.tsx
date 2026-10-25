import { FC } from 'react';

import { OModal, OSetting } from '@obsidian-lib/native-react-components';

import { UnitInfoProps } from './types/interfaces';

const InfoModal: FC<UnitInfoProps> = ({ info, onClose }) => (
        <OModal
            title='Image properties'
            onClose={onClose}
            width='500px'
            maxHeight='80vh'
        >
            {/* General Info */}
            <OSetting
                name='General Information'
                heading={true}
            />

            <OSetting
                name='Name'
                desc={info.name}
            />

            <OSetting
                name='Selector'
                desc={info.selector}
            />

            <OSetting
                name='Status'
                desc={info.enabled ? 'Enabled' : 'Disabled'}
            />

            <OSetting
                name='Element type'
                desc={info.elementType}
            />

            {/* Dimensions */}
            <OSetting
                name='Dimensions'
                heading={true}
            />

            <OSetting
                name='Width'
                desc={`${info.dimensions.width}px`}
            />

            <OSetting
                name='Height'
                desc={`${info.dimensions.height}px`}
            />

            {/* Source Location */}
            <OSetting
                name='Source Location'
                heading={true}
            />

            <OSetting
                name='Start line'
                desc={info.sourceLocation.lineStart.toString()}
            />

            <OSetting
                name='End line'
                desc={info.sourceLocation.lineEnd.toString()}
            />

            <OSetting
                name='Lines count'
                desc={info.sourceLocation.linesCount.toString()}
            />

            {/* Panels */}
            {info.panels.length > 0 && (
                <>
                    <OSetting
                        name='Panels'
                        heading={true}
                    />

                    {info.panels.map((panel, index) => (
                        <OSetting
                            key={`${index}-${panel.name}`}
                            name={panel.name}
                            desc={panel.enabled ? '✓ Enabled' : '✗ Disabled'}
                        />
                    ))}
                </>
            )}
        </OModal>
    );

export default InfoModal;
