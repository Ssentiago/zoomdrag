## [6.3.1] - 2026-10-11
Rebrand plugin from Image Zoom & Drag to Zoomdrag

# 6.3.0
## Features
- Add path exclusions: specify patterns to exclude certain files or folders from being processed by the plugin

# 6.2.0
## Features
- Revert SVG images (diagrams, etc.) to opening in Popup mode (beta)
- Add notification when copying via the image context menu is done
- Improve svg diagrams export: inline all CSS styles. What you see on screen is what gets exported / copied

## Fixes
- Fix issue with clicking links inside diagrams in live-preview mode

Thanks to @angelo-daumas for the fix

# 6.1.3

## Fixes
- Resolve bug with clicking links inside diagrams.

Thanks to @angelo-daumas and his #83

# 6.1.2

## Features
- All diagram panels are now visible by default (on fresh install)

## Fixes
- Keyboard shortcut `Shift + Mouse Scroll` now works properly on macOS
- All keyboard shortcuts with `Ctrl` key now also support `Cmd` key as modifier

Big thanks to @andybergon for both macOS fixes!

# 6.1.1

## Fixes
- Fixed navigation on the images gallery in popup mode and added on-screen navigation buttons

# 6.1.0
- Rebranded to Image Zoom & Drag

## Features
- Added `Open help guide` command to the command palette
- Add ability to change help guide mode

# 6.0.1

## Fixes
- Enable tip buttons for small panels

# 6.0.0

## BREAKING CHANGES

## Features

### Universal Image Support

The plugin now supports any SVG and IMG images, not just pre-configured diagram presets.

To enable: Image Zoom & Drag settings → Images → Presets → Enable the IMG_SVG preset

### Three Working Modes

Plugin operation is now divided into three modes:

- Integrated (classic mode as before)
- Picker (new)
- Popup (new)

### Integrated Mode
Integrated mode is where the plugin makes images interactive directly in place within the note.

Changes:
- `Toggle panel visibility` command logic changed - now toggles panel visibility for all images in the note
- Reset zoom and position with double-click/double-tap on images
- Added ``CTRL + ` `` shortcut to fold/unfold images
- Added `CTRL + ALT + F` shortcut to toggle fullscreen mode for images
- Auto-activation of images can now be disabled (Settings → Images → General → Autodetect images)
- Reorganized right-click context menu for images
- Added "Info" context menu item to display image information in a modal window
- Images can now be toggled between interactive and non-interactive states
- Added "Copy as..." and "Export as..." options to context menu
- Improved native touch event handling - now disabled at leaf level instead of individual images (Mobile)
- Better image size adaptation to actual viewport size (large images should now fit properly)
- Images now adapt to window resize
- Added tip button to images (shown during first week after plugin installation)
- Images in open notes now respond immediately to size changes in settings
- Added option to control context menu for different image types: auto-generated (diagrams) vs all others (Settings → Images → General → Context menu)


### Popup Mode
Popup mode opens images in a separate modal window.

Don't confuse with fullscreen mode:
- Popup = separate window with image copy
- Fullscreen = same image but full screen

Features:

- Open individual images or all images from a note in popup mode
    - Individual images can be opened by:
        - Right-click context menu on image (if already interactive) → `Open in popup`
        - Activate Picker mode → `Alt + Click` on image
    - All images in a note can be opened via the note toolbar button `Open view image gallery in popup window`
- Zoom and drag images within popup window
    - `Click + Drag` - change image position (dx/dy)
    - `Wheel` - change image scale
- Popup window can be closed or minimized. When minimized, it becomes a button in the bottom-right corner showing the count of open images. Opening new images in popup mode with a minimized button will add them to the existing image gallery.

### Picker Mode
Picker mode highlights all suitable images and allows switching them between popup and integrated modes.

Features:

- This mode is disabled by default. Enable it in Settings → Images → General → Enable Picker mode
- To toggle picker mode state:
    - Click the picker mode button in the left ribbon panel
    - Open command palette and search for "picker mode", activate
- When activated, all suitable images are highlighted with an accent border
- Clicking on an image (if it belongs to a note) toggles its state between interactive and non-interactive
- `Alt + Click` - switch image to popup mode

### Internationalization System

Starting with this release, the plugin supports internationalization. If you want to help translate the plugin to your native language, refer to the [documentation](docs/TRANSLATION_GUIDE.md) for additional instructions.

### Settings

Changes:
- Settings navigation logic changed. Removed the previous navbar navigation system, now using a sidebar (sidebar activation button is in the top-left corner of the plugin settings window)
- Completely reorganized settings structure: Images (subsections: General, Presets, Controls), Debug, About
- Added new help page item to the About section


### Help Guide

This release adds a built-in help guide to the plugin. If something about the plugin's features is unclear or you simply forgot keyboard shortcuts - don't hesitate to use it!

How to access:
- On first plugin startup: a notification appears in the top-right corner inviting you to explore the helper. Just click on it
- During the first week after plugin installation: all active images will have a tip button that opens a brief reference of main hotkeys available in integrated mode
- Anytime: Settings → About → Help (opens the complete guide covering all plugin features)

# 5.3.0

## Features

- Button presets: Mobile, desktop, and presentation mode presets for panel buttons
- Enhanced scrolling: Horizontal diagram scrolling with `SHIFT + WHEEL` and vertical scrolling with `SHIFT + ALT + WHEEL`
- Debug page: Settings page with logging configuration and issue template generator
- Panel behavior settings: Configure panel visibility (always visible, on hover, on click) with separate service panel override
- Settings animations: Smooth transitions between settings pages
- Isolated diagram state: Automatic resource cleanup when closing tabs or disabling plugin
- Automatic settings migration: Seamless updates from previous plugin versions
- Button configuration modal: Enable/disable specific buttons in each panel
- Panel position modals: Visual configuration for panel positioning on diagrams

## Bug Fixes

- Fixed issue where images sometimes failed to copy/save from context menu
- Fixed resource cleanup bugs where MutationObservers weren't properly disposed, causing UI glitches

# 5.2.0

## Features

- Add support for setting diagram units in percentages (thanks to @NINE-J for the idea and great work on initial implementation!). Also #46 mentioned a similar idea.
- Remove the setting for rendering diagrams at their original size, as it is no longer relevant (just set width and height to 100%). Relative sizes for diagrams are calculated based on their original size during rendering, provided by Obsidian

## Bug Fixes

- Resolve all visual issues with diagram rendering:
  - Live Preview:
    - Sometimes diagrams might not render when opening a note in Live Preview mode if it contains multiple diagrams. Fixed.
    - Sometimes diagrams might not render when opening a note in Preview mode and then switching to Live Preview. Fixed.
    - As a result, issue #48 are likely resolved. If not, please let us know.
  - Preview:
    - In some edge cases, diagrams might not render. Fixed.

# 5.1.0

## Features

- Added an option to render diagrams in their original size (#48, may also resolve #46)

## Bug Fixes

- Fixed an issue where diagrams opened in a new window were not rendered in Markdown Live Preview mode (#45)

## Minor

- Renamed several text fields in the Settings Page for clarity
- Added animations to the Settings Page

# 5.0.1

## Minor

- Manifest update

# 5.0.0

## Features

### Diagram Support

- Full support for both Preview and Live Preview modes
- Consistent behavior and features across both modes

### New features

- Added context menu for diagram container with options:
  - Export diagram
  - Copy diagram
  - Copy diagram source
  > Note: Export and Copy functions may have issues with some diagrams (known problem with Mehrmaid). Perhaps this will be fixed in the future
- Improved Fullscreen Experience (#36)
  - Simplified zoom: now works with just mouse wheel (no CTRL needed)
  - Collapsed diagram mode now only displays fullscreen and fold buttons

### Settings Page Overhaul

#### Diagram/Settings

- Diagram collapse setting (relocated from other sections)
- New size adjustment options:
  - Control diagram size in expanded state
  - Control diagram size in collapsed state
      (#36, #26)

#### Diagram/Management

- Core functionality preserved:
  - Add new diagram
  - Diagram per page
  - Diagram pagination
- Users can now enter any valid css selectors they want #36
- Enhanced pagination features:
  - Enable/disable specific diagrams (disabled ones are ignored by plugin) #36
  - Edit existing diagrams (name and selector)
  - Configure diagram-specific controls (service, zoom, move)
- Improved user guide:
  - Clearer and more comprehensive instructions

#### Panels/Settings
>
> Important: This section is not available on mobile devices

- Hide panels when mouse leaves diagram (relocated)
- New: Optional button in service panel to hide other panels
- Removed: "hide panels when mouse leaves them" option

#### Panels/Management

- Complete panel layout customization:
  - Enable/disable specific panels (applies globally)
  - Configure panel creation positions
  - Flexible positioning system with mouse and touch support
  - Intuitive drag-and-drop interface for both desktop and mobile devices

#### About

- Direct links to:
  - Plugin repository
  - Feedback submission

# 4.2.7

## Features

- Added the `Toggle panel visibility` command to the command palette, allowing users to toggle the panel state in the active diagram.
- Users can now assign a custom hotkey for this command in the Obsidian settings.
- Removed the outdated `CTRL + M` hotkey.

# 4.2.6

## Features

- Added three options for hiding panels in the plugin settings:
  - Hide panels when mouse leaves diagram
  - Hide panels when mouse leaves them
  - Hide panels by pressing Ctrl + M
- Removed the opacity control option

Related to #26

# 4.2.5

### Feature

- Panels opacity now is at 10 by default

# 4.2.4

### Features

- Add show/hide buttons on mouse hover: buttons will be visible when the mouse is over the panel and transparent when the mouse leaves.
- Introduce a new options to set folding and opacity levels when hidden.
- Provide a default selector class for use by other plugins if needed.

### Bugfixes

- Resolve issue #25 related to background in fullscreen mode.
- Fix issue with maximum recursion depth in plugin settings when switching toggles.

# 4.2.3

### Feature

- Add diagram folding  
- Add button for diagram folding  
- Add folding option to the plugin settings:  
  - Fold by default  
  - Automatic folding/unfolding on focus change

# 4.2.2

Rename to diagram-zom-drag

# 4.2.1

### Feature

- Add input field validation when adding new diagram in the plugin settings

# 4.2.0

### Feature

- Added data saving for each diagram container in view, including position and zoom. Data persists even when switching between multiple views.
- Added support for new diagram types: tested with PlantUML and Graphviz.
- Added a plugin settings tab:
  - Option to add new diagram types: specify the name and div class.
  - Short user guide for finding divs (click on the extra button next to the "Add New Data" button).
  - List of all diagrams in the settings, with the ability to delete unnecessary ones.
  - Button to restore settings to default.

### Bugfix

- Restored plugin controls in live-preview mode.

# 4.1.50

### Feature

- Add support for [Mehrmaid](https://github.com/huterguier/obsidian-mehrmaid) diagrams
- Reorganize control panel:
  - Service panel at the top right corner:
    - Hide / show action: hide / show other panels
    - Open in fullscreen mode / exit fullscreen mode: enables or disables fullscreen mode for the diagram

  - Zoom panel at the right edge at the center:
    - Zoom in: zoom in the diagram
    - Reset zoom and position: reset zoom and position of the diagram
    - Zoom out: zoom out the diagram

  - Move panel at the bottom:
    - All actions move the diagram to the specified side

- Implement diagram management with keyboard (replicates the move panel's buttons behavior):
  - Keyboard:
    - `CTRL` + `+`/`=`: zoom in
    - `CTRL` + `-`: zoom out
    - `CTRL` + `0`: reset zoom and position
    - ArrowUp, ArrowDown, ArrowLeft, ArrowRight: moves the diagram to the specified side

# 4.1.49

Add featrue: the open button would be a close one when in fullscreen mode

# 4.1.48

add button for open diagram in fullscreen mode
add touch and pinch-to-zoom functionality for mobile devices

# 4.1.47

add an eye button to hide or display the control panel
align center elements in mermaid div
add mermaid-zoom-drag-demo.gif

# 4.1.46

remove document

# 4.1.45

Add a control panel to shift and zoom diagrams

# 4.1.44

use getActiveViewOfType

# 4.1.43

avoid assigning styles

# 4.1.42

put code into main.ts

# 4.1.41

Use Markdownpostproccessor

# 4.0.38

del evt of resize and layout-change

# 4.0.37

remove the event in resize event
update the way to get version
update the description

# 4.0.36

update id, name and tag and remove authorUrl， add .gitignore file

# 4.0.35

fixed a bug that output incorrect version

# 4.0.34

Just make the mermaid test code less in readme file. But the code is the same as before, and also the function. Because its going to submit for obsidian offical, so i upgrade the version.

# 4.0.33

release to submitssion to obsidian officail for sharing a little plugin for zoom or drag mermaid diagrams in obsidian.
