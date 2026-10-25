import { t } from '@/lang';

import { TriggerType } from '../../types/constants';
import { updateButton } from '../helpers/helpers';
import { IControlPanel } from '../types/interfaces';
import { BasePanel } from './base-panel';
import { FoldButtons } from './types/constants';
import { ButtonsData } from './types/interfaces';

export class FoldPanel extends BasePanel<FoldButtons> {
    buttons = new Map<FoldButtons, ButtonsData>();

    title = {
        folded: t.image.controlPanel.fold.fold.folded,
        expanded: t.image.controlPanel.fold.fold.expanded,
    };

    constructor(public readonly controlPanel: IControlPanel) {
        super(controlPanel);
        this.setupSubscriptions();
    }

    get enabled(): boolean {
        return true;
    }

    get cssStyles(): object {
        return {
            position: 'absolute',
            left: '50%',
            bottom: '0',
            transform: 'translateX(-50%)',
            gridTemplateColumns: '1fr',
        };
    }

    get cssClass(): string {
        return 'izd-fold-panel';
    }

    getButtonsConfig(): {
        icon: string;
        action: () => void;
        title: string;
        id: FoldButtons;
    }[] {
        this.unit.context.container.setAttribute(
            'data-folded',
            this.unit.plugin.settings.$.units.folding.foldByDefault.toString()
        );

        return [
            {
                icon: '',
                action: (): void => {
                    const wasFolded =
                        this.unit.context.container.dataset.folded === 'true';

                    wasFolded ? this.unfold() : this.fold();
                },
                title: '',
                id: FoldButtons.Fold,
            },
        ];
    }

    fold(): void {
        this.unit.context.container.setAttribute('data-folded', 'true');
        this.unit.applyLayout();

        this.controlPanel.hide(TriggerType.FOLD);
    }

    unfold(): void {
        this.unit.context.container.setAttribute('data-folded', 'false');
        this.unit.applyLayout();

        this.controlPanel.show(TriggerType.FOLD);
    }

    protected get supportedTriggers(): number {
        return (
            super.supportedTriggers &
            ~TriggerType.FOLD &
            ~TriggerType.SERVICE_HIDING &
            ~TriggerType.FOCUS &
            ~TriggerType.MOUSE
        );
    }

    setupSubscriptions(): void {
        const foldCondition = (mutation: MutationRecord) =>
            mutation.target === this.unit.context.container &&
            mutation.type === 'attributes' &&
            mutation.attributeName === 'data-folded';

        this.register(() =>
            this.unit.plugin.domWatcher.unsubscribe(foldCondition)
        );

        this.unit.plugin.domWatcher.subscribe(foldCondition, (mutation) => {
            if (!(mutation.target.instanceOf(HTMLElement))) return;
            const isFolded = mutation.target.dataset.folded === 'true';

            const button = this.buttons.get(FoldButtons.Fold);

            if (button) {
                updateButton(
                    button.element,
                    isFolded ? 'unfold-vertical' : 'fold-vertical',
                    this.title[!isFolded ? 'expanded' : 'folded']
                );
            }
        });
    }
}
