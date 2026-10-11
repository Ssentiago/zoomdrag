import Help from '@/core/services/help/help';
import { HelpRootProps } from '@/core/services/help/ui/HelpRoot';
import HelpSection from '@/core/services/help/ui/HelpSection';
import { BaseUnitContext } from '@/core/services/types/interfaces';

import { FC, useEffect, useRef, useState } from 'react';

import { OModal } from '@obsidian-lib/native-react-components';
import { Component, MarkdownRenderer } from 'obsidian';
import styled from 'styled-components';

const ModeToggle = styled.div`
    margin-bottom: 16px;
    padding: 8px 12px;
    background: var(--background-secondary);
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
`;

const ToggleButton = styled.button`
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background: var(--background-primary);
    cursor: pointer;

    &:hover {
        background: var(--background-modifier-hover);
    }
`;

const ContentWrapper = styled.div`
    display: flex;
    gap: 20px;
`;

const DemoContainer = styled.div`
    flex: 0 0 300px;
    max-height: calc(100vh - 40px);

    position: sticky;
    top: 20px;

    overflow: hidden;

    display: flex;
    align-items: flex-start;
    justify-content: center;
`;
const IntegratedSection = styled.div`
    flex: 1;
    min-width: 0;
`;

interface HelpContentProps extends HelpRootProps {}

const testMermaidContent = `
\`\`\`mermaid
graph TD
    A[Start] --> B[Process 1]
    B --> C{Decision}
    C -->|Yes| D[Process 2]
    C -->|No| E[Process 3]
    D --> F[End]
    E --> F
\`\`\`
`;

const getBaseContext = (svg: SVGElement): BaseUnitContext => {
    const ctx = {} as BaseUnitContext;

    ctx.element = svg;
    ctx.elementType = 'svg';
    ctx.origin = 'generated';
    ctx.mode = 'preview';
    ctx.sourceData = {
        source: testMermaidContent,
        lineStart: 0,
        lineEnd: testMermaidContent.length - 1,
    };
    return ctx;
};

const renderMermaid = async (
    help: Help,
    container: HTMLDivElement,
    component: Component
) => {
    await MarkdownRenderer.render(
        help.plugin.app,
        testMermaidContent,
        container,
        '',
        component
    );
    const svg = container.querySelector('svg');
    if (svg) {
        const ctx = getBaseContext(svg);
        help.plugin.emitter.emit('create-integrated-element-outside-view', ctx);
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
};

const HelpContent: FC<HelpContentProps> = ({
    onClose,
    mode: externalMode,
    help,
}) => {
    const diagramSectionRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState(externalMode);

    useEffect(() => {
        let component: Component | null = null;

        (async () => {
            if (!diagramSectionRef.current) return;

            component = new Component();
            component.load();
            await renderMermaid(help, diagramSectionRef.current, component);
        })();
        return () => {
            component?.unload();
        };
    }, [help, diagramSectionRef]);

    return (
        <OModal
            onClose={onClose}
            title={'Zoomdrag Help'}
            height={'100%'}
            width={'100%'}
        >
            <ModeToggle>
                <span>Help mode: {mode === 'full' ? 'Detailed' : 'Quick'}</span>
                <ToggleButton
                    onClick={() =>
                        setMode(mode === 'full' ? 'minimal' : 'full')
                    }
                >
                    {mode === 'full' ? 'Show less' : 'Show more'}
                </ToggleButton>
            </ModeToggle>
            {mode === 'full' && (
                <HelpSection title={'Picker mode'}>
                    <p>
                        Picker mode allows you to convert any image into both
                        modes mentioned below: integrated and popup.
                    </p>
                    <p>
                        Works with images 64px+ (smaller ones aren't practical
                        to interact with)
                    </p>
                    <p>
                        You can enable picker mode at: Settings → Image Zoom &
                        Drag Settings → Images → General →{' '}
                        <kbd>Enable Picker Mode</kbd>
                    </p>
                    <p>
                        Activate picker mode: ribbon button on the left or
                        command in command palette:{' '}
                        <kbd>Toggle picker mode</kbd>
                    </p>
                    <p>
                        This mode allows you to convert any suitable image into
                        integrated or popup modes
                    </p>
                    <p>
                        In this mode, the plugin automatically scans the DOM and
                        highlights all suitable images with a light blue dashed
                        outline.
                    </p>
                    <p>
                        <kbd>Click</kbd> on a suitable image will toggle it to
                        integrated mode
                    </p>
                    <p>
                        <kbd>Alt + Click</kbd> on an integrated image will
                        toggle it to popup mode
                    </p>
                </HelpSection>
            )}

            <ContentWrapper>
                <IntegratedSection>
                    <HelpSection title={'Integrated Mode'}>
                        <p>Basic controls:</p>
                        <p>
                            <kbd>Click</kbd> - focus on image
                        </p>
                        <p>
                            <kbd>Click + Drag</kbd> - change visual position by
                            dx/dy
                        </p>
                        <p>
                            <kbd>Ctrl + Wheel up / down</kbd> - change diagram
                            scale
                        </p>
                        <p>
                            <kbd>Shift + Wheel</kbd> - move diagram horizontally
                        </p>
                        <p>
                            <kbd>Shift + Alt + Wheel</kbd> - move diagram
                            vertically
                        </p>
                        <p>
                            <kbd>Ctrl + ` (backtick)</kbd> - collapse / expand
                            diagram
                        </p>
                        <p>
                            <kbd>Ctrl + Alt + F</kbd> - switch fullscreen mode
                        </p>
                        <p>
                            <kbd>Double click / Double tap</kbd> - reset
                            position and scale
                        </p>
                        <p>
                            <kbd>Arrow keys</kbd> - move diagram in specified
                            direction
                        </p>
                        <p>
                            <kbd>Ctrl + Minus</kbd> - zoom out
                        </p>
                        <p>
                            <kbd>Ctrl + Plus</kbd> - zoom in
                        </p>
                        <p>
                            <kbd>Ctrl + 0</kbd> - reset scale
                        </p>
                        <p>
                            <kbd>Right click</kbd> - open context menu
                        </p>
                        {mode === 'full' && (
                            <>
                                <p>
                                    Integrated mode is the default mode for
                                    interactive images in your notes.
                                </p>
                                <p>
                                    By default, the plugin only works with
                                    auto-generated diagrams (Mermaid, PlantUML,
                                    etc.) that match built-in presets.
                                </p>
                                <p>
                                    To enable for regular images: Obsidian
                                    Settings → Plugins → Zoomdrag
                                    Settings → Images → Presets → IMG_SVG.
                                </p>
                                <p>
                                    Enable the "IMG_SVG" preset to make all
                                    images interactive, not just diagrams.
                                </p>
                                <p>
                                    An image that becomes interactive gets
                                    extended capabilities: zoom, drag, etc.
                                </p>
                                <p>
                                    Doesn't affect performance - all images are
                                    cleaned up when closing the note.
                                </p>
                                <p>
                                    Besides basic functions, you can enable
                                    control panels on images.
                                </p>
                                <p>
                                    Control panels available: zoom, movement,
                                    collapse/expand and fullscreen mode.
                                </p>
                                <p>Disabled by default.</p>
                                <p>
                                    Enable for all diagrams: Settings → Images →
                                    Controls.
                                </p>
                                <p>
                                    Configure for specific type: Settings →
                                    Images → Presets.
                                </p>
                            </>
                        )}
                    </HelpSection>
                </IntegratedSection>

                <DemoContainer ref={diagramSectionRef}></DemoContainer>
            </ContentWrapper>
            {mode === 'full' && (
                <HelpSection title={'Popup mode'}>
                    <p>
                        Popup mode displays images in a fullscreen overlay
                        window.
                    </p>
                    <p>Three ways to open popup:</p>
                    <p>• Alt + Click in picker mode</p>
                    <p>• Through image context menu</p>
                    <p>• Note panel button (for all images in the note)</p>
                    <p>
                        Controls: <kbd>Wheel</kbd> - zoom,{' '}
                        <kbd>Click + Drag</kbd> - pan
                    </p>

                    <p>
                        Popup mode supports working with multiple images
                        simultaneously
                    </p>
                    <p>
                        Close popup with Esc key or the close button in the top
                        right corner
                    </p>
                    <p>
                        You can minimize the popup by clicking the minimize
                        button next to the close button. It collapses to a
                        floating button in the bottom right corner
                    </p>
                    <p>
                        The button shows the number of open images and can be
                        moved anywhere.
                    </p>
                    <p>
                        Switch between images: click any image in the gallery at
                        the bottom of the screen.
                    </p>
                    <p>
                        Limitation: works only with regular images (PNG, JPG).
                        SVG support is planned for future versions.
                    </p>
                </HelpSection>
            )}
        </OModal>
    );
};

export default HelpContent;
