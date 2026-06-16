/**
 * Hotkey Visualizer — entry point.
 *
 * Wires up settings registration and the floating launcher button using stable,
 * non-deprecated ApplicationV2 / namespaced APIs (target Foundry v13–v14).
 */

import { MODULE_ID } from "./constants.mjs";
import { registerSettings, registerKeybindVisibilitySettings } from "./settings.mjs";
import { injectButton, repositionButton } from "./button.mjs";
import { HotkeyVisualizer } from "./apps/visualizer.mjs";

Hooks.once("setup", () => {
  // Registered on `setup` so all keybindings (registered during `init`) exist and
  // their per-keybind visibility settings are available before the UI / Nik's run.
  registerSettings();
});

Hooks.once("ready", () => {
  // Core (and some module) keybindings are registered after module `setup` hooks,
  // so register any remaining per-keybind visibility settings now that all exist.
  registerKeybindVisibilitySettings();

  injectButton();

  // Expose a small API for macros / other modules.
  const module = game.modules.get(MODULE_ID);
  if ( module ) {
    module.api = {
      open: () => HotkeyVisualizer.open(),
      toggle: () => HotkeyVisualizer.toggle()
    };
  }
});

// The players list re-renders on user connect/disconnect; re-inject and reposition
// so our button keeps its place just to the right of it.
Hooks.on("renderPlayers", () => {
  injectButton();
  repositionButton();
});

// Keep the button glued to the players list when the window is resized.
window.addEventListener("resize", () => repositionButton());
