import { ImageConfigs } from '@/modes/integrated-mode/integrated-unit/types/constants';
import {
    DebugLevel,
    DefaultSettings,
    PanelsTriggering,
} from '@/settings/types/interfaces';

export function defaultSettings(): DefaultSettings {
    return {
        units: {
            contextMenu: {
                showForDiagrams: true,
                showForOtherImages: false,
            },
            interactivity: {
                markdown: {
                    autoDetect: true,
                },
                picker: {
                    enabled: false,
                },
            },
            folding: {
                foldByDefault: false,
                autoFoldOnFocusChange: false,
            },
            settingsPagination: {
                perPage: 5,
            },
            size: {
                expanded: {
                    width: {
                        value: 100,
                        type: '%',
                    },
                    height: {
                        value: 100,
                        type: '%',
                    },
                },
                folded: {
                    width: {
                        value: 50,
                        type: '%',
                    },
                    height: {
                        value: 50,
                        type: '%',
                    },
                },
            },
            configs: Object.entries(ImageConfigs).map(([key, value]) => ({
                name: key,
                selector: value,
                on: value !== ImageConfigs.IMG_SVG,
                panels: {
                    move: {
                        on: true,
                    },
                    zoom: {
                        on: true,
                    },
                    service: {
                        on: true,
                    },
                },
            })),
            exclusions: {
                patterns: '',
            },
        },
        panels: {
            global: {
                triggering: {
                    mode: PanelsTriggering.ALWAYS,
                    ignoreService: true,
                },
            },
            local: {
                preset: 'none',
                panels: {
                    service: {
                        on: true,
                        buttons: {
                            hide: true,
                            fullscreen: true,
                        },
                        position: {
                            top: '0px',
                            right: '0px',
                        },
                    },
                    move: {
                        on: true,
                        buttons: {
                            up: true,
                            down: true,
                            left: true,
                            right: true,
                            upLeft: true,
                            upRight: true,
                            downLeft: true,
                            downRight: true,
                        },
                        position: {
                            bottom: '0px',
                            right: '0px',
                        },
                    },
                    zoom: {
                        on: true,
                        buttons: {
                            in: true,
                            out: true,
                            reset: true,
                        },
                        position: {
                            top: '50%',
                            right: '0px',
                        },
                    },
                },
            },
        },
        debug: {
            enabled: false,
            level: DebugLevel.None,
        },
    };
}
