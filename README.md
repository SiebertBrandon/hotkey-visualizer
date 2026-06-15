# Hotkey Visualizer

A FoundryVTT module that adds a floating button near the players list which opens a
window visualizing **every keybinding available to the player** — pulled live from
Foundry's configured keybindings, including modifier keys (Ctrl/Shift/Alt), reserved
modifiers, and conditions (GM-only, repeatable).

Each keybind also gets an individual **visibility toggle**, collected into a single
settings menu. Because every toggle is a separate **client-scoped** setting, a GM can use
[Nik's Settings Locks](https://github.com/nschoenwald/niks-settings-locks) to lock
specific ones OFF — hiding chosen keybinds from players while the GM still sees everything.

- **Foundry compatibility:** verified on **v14** (minimum v13).
- Built entirely on the modern **ApplicationV2** / namespaced APIs — no deprecated paths.

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
   `https://github.com/CHANGEME/hotkey-visualizer/releases/latest/download/module.json`
3. Click **Install**, then enable it in your world via **Game Settings → Manage Modules**.

### Manual / development install
Copy or symlink this folder into your Foundry data directory so it lives at:

```
<FoundryUserData>/Data/modules/hotkey-visualizer/
```

Then restart Foundry and enable **Hotkey Visualizer** in **Manage Modules**.

> Tip (Windows, dev): from an elevated shell you can symlink your working copy:
> `New-Item -ItemType SymbolicLink -Path "<FoundryUserData>\Data\modules\hotkey-visualizer" -Target "<this repo>"`

## Usage

1. Click the **keyboard button** at the bottom-left (just right of the players list) to
   open the visualizer.
2. Adjust which keybinds appear via **Game Settings → Configure Keybind Visibility**.
3. Nudge the button position with **Button horizontal/vertical offset** settings.

## GM: hiding keybinds from players (Nik's Settings Locks)

1. Install **[libWrapper](https://github.com/ruipin/fvtt-lib-wrapper)** and
   **[Nik's Settings Locks](https://github.com/nschoenwald/niks-settings-locks)**.
2. Open Nik's **Lock Manager** and filter for `hotkey-visualizer`. Each keybind's
   `Show keybind: …` setting is listed.
3. **Hard-lock** a setting to OFF to hide that keybind from players. GMs remain
   runtime-exempt and continue to see all keybinds.

> If a keybind's toggle does not appear in Nik's, enable **Show per-keybind toggles in
> Configure Settings** in this module's settings and reload.

## How it works (developer notes)

- Keybinds are read from `game.keybindings.actions` and `game.keybindings.get()`.
- The window and toggle menu are `ApplicationV2` + `HandlebarsApplicationMixin` apps.
- The launcher button is injected on `renderPlayers` / `ready` and positioned relative
  to `#players` using client-scoped offset settings.
- An API is exposed at `game.modules.get("hotkey-visualizer").api` with `open()` and
  `toggle()`.

## Releasing

Tag a release and attach a `module.json` (with `manifest`/`download` pointing at the
release assets) plus a `module.zip` of the module folder. The manifest's
`releases/latest/download/...` URLs will then resolve automatically.

## License

[MIT](LICENSE) © Brandon Siebert
