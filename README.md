# Hotkey Visualizer

A FoundryVTT module that adds a floating button near the players list which opens a
window visualizing every keybinding available to the player including modifier keys (Ctrl/Shift/Alt), reserved
modifiers, and conditions (GM-only, repeatable). Each keybind also gets an individual visibility toggle, collected into a single
settings menu.

For Foundry v14

## Features

- 🎹 **Visualizer window** — keybinds grouped by source (Core, your game system, each
  module), with searchable rows showing the bound key, modifier chips, reserved
  modifiers, and GM-only / repeatable badges. Plenty of room for many kinds of binds.
- 🔘 **Floating launcher button** anchored just to the right of the players list, with
  configurable X/Y pixel offsets so it fits your UI/theme.
- ✅ **One toggle menu** (Game Settings → *Configure Keybind Visibility*) to show/hide
  individual keybinds, with search and bulk show/hide.
- 🔒 **Nik's Settings Locks ready** — each toggle is an individual client-scoped setting
  the GM can hard-lock to hide keybinds from players.

## Installation

### From a manifest URL (recommended)
1. In Foundry: **Setup → Add-on Modules → Install Module**.
2. Paste the manifest URL into the **Manifest URL** field:
   `https://github.com/SiebertBrandon/hotkey-visualizer/releases/latest/download/module.json`
3. Click **Install**, then enable it in your world via **Game Settings → Manage Modules**.

## Usage

1. Click the keyboard button at the bottom-left (just right of the players list) to
   open the visualizer.
2. Adjust which keybinds appear via Game Settings → Configure Keybind Visibility.
3. Nudge the button position with Button horizontal/vertical offset settings.

## License

[MIT](LICENSE) © Brandon Siebert
