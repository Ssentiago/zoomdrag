import { t, tf } from '@/lang';

import {
    UseImageConfigOperationsReturn,
} from './types/interfaces';
import { useUnitsHistoryContext } from '../../context/HistoryContext';
import { useUnitsManagerContext } from '../../context/UnitsManagerContext';
import { useUnitsValidation } from '../../hooks/useUnitsValidation';

export const useImageConfigOperations = (): UseImageConfigOperationsReturn => {
    const { validateBoth, processValidationOnSave } = useUnitsValidation();
    const { units, saveUnits } = useUnitsManagerContext();
    const { updateUndoStack } = useUnitsHistoryContext();

    const handleDelete = async (index: number) => {
        const oldUnits = [...units];
        const newUnits = [...units];
        const deleted = newUnits[index];
        newUnits.splice(index, 1);

        await saveUnits(newUnits);
        updateUndoStack(
            oldUnits,
            tf(
                t.settings.pages.images.presets.availableImageConfigs.item
                    .actions.delete,
                {
                    name: deleted.name,
                    selector: deleted.selector,
                }
            )
        );
    };

    const handleToggle = async (index: number, value: boolean) => {
        const oldUnits = JSON.parse(JSON.stringify(units)) as typeof units;
        units[index].on = value;
        await saveUnits([...units]);
        const action = value
            ? t.settings.pages.images.presets.availableImageConfigs.item.actions
                  .enable
            : t.settings.pages.images.presets.availableImageConfigs.item.actions
                  .disable;
        const undoDesc = tf(action, {
            name: units[index].name,
        });
        updateUndoStack(oldUnits, undoDesc);
    };

    const handleSaveEditing = async (index: number) => {
        const oldUnits = JSON.parse(JSON.stringify(units)) as typeof units;

        const oldUnit = units[index];

        const editingNameInput: HTMLInputElement | null =
            document.querySelector('#editing-name-input');
        const editingSelectorInput: HTMLInputElement | null =
            document.querySelector('#editing-selector-input');
        if (!editingNameInput || !editingSelectorInput) {
            return undefined;
        }

        const validationResult = validateBoth(
            editingNameInput.value,
            editingSelectorInput.value,
            oldUnit
        );
        const validated = processValidationOnSave(validationResult);

        if (validated) {
            const oldName = oldUnit.name;
            const oldSelector = oldUnit.selector;
            const nameChanged = oldName !== editingNameInput.value;
            const selectorChanged = oldSelector !== editingSelectorInput.value;
            units[index].name = editingNameInput.value;
            units[index].selector = editingSelectorInput.value;
            await saveUnits([...units]);
            editingNameInput.removeAttribute('id');
            editingSelectorInput.removeAttribute('id');

            const changes = [];
            if (nameChanged) {
                changes.push(
                    tf(
                        t.settings.pages.images.presets.availableImageConfigs
                            .item.actions.changes.name,
                        {
                            old: oldName,
                            new: units[index].name,
                        }
                    )
                );
            }
            if (selectorChanged) {
                changes.push(
                    tf(
                        t.settings.pages.images.presets.availableImageConfigs
                            .item.actions.changes.selector,
                        {
                            old: oldSelector,
                            new: units[index].selector,
                        }
                    )
                );
            }

            updateUndoStack(
                oldUnits,
                tf(
                    t.settings.pages.images.presets.availableImageConfigs.item
                        .actions.edit,
                    {
                        name: units[index].name,
                        changes: changes.join('\n'),
                    }
                )
            );
        }
        return {
            validationResult,
            validated,
        };
    };

    return {
        handleDelete,
        handleToggle,
        handleSaveEditing,
    };
};
