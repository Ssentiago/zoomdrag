import AddNewImagePreset from '@/settings/ui/pages/images/presets/add-new-image-preset/AddNewImagePreset';
import AvailableImagePresets from '@/settings/ui/pages/images/presets/available-image-presets/AvailableImagePresets';

import { FC } from 'react';

import { UnitsHistoryProvider } from './context/HistoryContext';
import { useUnitsManagerContext } from './context/UnitsManagerContext';

const Presets: FC = () => {
    const { units, saveUnits } = useUnitsManagerContext();

    return (
        <UnitsHistoryProvider
            state={units}
            updateState={saveUnits}
        >
            <AddNewImagePreset />
            <AvailableImagePresets />
        </UnitsHistoryProvider>
    );
};

export default Presets;
