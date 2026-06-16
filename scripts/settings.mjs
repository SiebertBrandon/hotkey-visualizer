/**
 * Settings registration for Hotkey Visualizer.
 *
 * The per-keybind visibility toggles are registered as individual **client-scoped**
 * boolean settings. Registering them individually (rather than as one blob) is what
 * lets Nik's Settings Locks discover and lock them so a GM can hide specific keybinds
 * from players while remaining runtime-exempt themselves.
 */

import { MODULE_ID, SETTINGS, showSettingKey } from "./constants.mjs";
import { HotkeyToggleMenu } from "./apps/toggle-menu.mjs";
import { HotkeyVisualizer } from "./apps/visualizer.mjs";
import { repositionButton } from "./button.mjs";

/**
 * Register all module settings. Must run on `setup`, after `init` (when other
 * modules/systems have registered their keybindings) so `game.keybindings.actions`
 * is fully populated, and early enough for Nik's Settings Locks load-time enforcement.
 */
export function registerSettings() {
  // Whether the per-keybind settings appear in the core Configure Settings window.
  // Read first so the per-keybind registrations below can honor it.
  game.settings.register(MODULE_ID, SETTINGS.EXPOSE_INDIVIDUAL, {
    name: "HOTKEYVIS.Settings.ExposeIndividual.Name",
    hint: "HOTKEYVIS.Settings.ExposeIndividual.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true
  });

  // Floating button pixel offsets (from the anchor just-right of the players list).
  game.settings.register(MODULE_ID, SETTINGS.BUTTON_OFFSET_X, {
    name: "HOTKEYVIS.Settings.OffsetX.Name",
    hint: "HOTKEYVIS.Settings.OffsetX.Hint",
    scope: "client",
    config: true,
    type: Number,
    default: 0,
    onChange: () => repositionButton()
  });
  game.settings.register(MODULE_ID, SETTINGS.BUTTON_OFFSET_Y, {
    name: "HOTKEYVIS.Settings.OffsetY.Name",
    hint: "HOTKEYVIS.Settings.OffsetY.Hint",
    scope: "client",
    config: true,
    type: Number,
    default: 0,
    onChange: () => repositionButton()
  });

  // One toggle-list menu collecting every per-keybind visibility setting.
  game.settings.registerMenu(MODULE_ID, "toggleMenu", {
    name: "HOTKEYVIS.Settings.ToggleMenu.Name",
    label: "HOTKEYVIS.Settings.ToggleMenu.Label",
    hint: "HOTKEYVIS.Settings.ToggleMenu.Hint",
    icon: "fa-solid fa-keyboard",
    type: HotkeyToggleMenu,
    restricted: false
  });

  registerKeybindVisibilitySettings();
}

/**
 * Register one client-scoped boolean visibility setting per registered keybinding.
 *
 * Idempotent: skips any action whose setting already exists. Called once on `setup`
 * (for keybindings registered during `init`) and again on `ready` (to catch core and
 * other keybindings that Foundry registers after module `setup` hooks run).
 */
export function registerKeybindVisibilitySettings() {
  const exposeInUI = game.settings.get(MODULE_ID, SETTINGS.EXPOSE_INDIVIDUAL);
  const actions = game.keybindings?.actions ?? new Map();

  for ( const [actionId, config] of actions.entries() ) {
    const key = showSettingKey(actionId);
    if ( game.settings.settings.has(`${MODULE_ID}.${key}`) ) continue;
    const name = config.name ? game.i18n.localize(config.name) : actionId;
    game.settings.register(MODULE_ID, key, {
      name: game.i18n.format("HOTKEYVIS.Settings.ShowKeybind.Name", { name }),
      hint: "HOTKEYVIS.Settings.ShowKeybind.Hint",
      scope: "client",
      config: exposeInUI,
      type: Boolean,
      default: true,
      onChange: () => HotkeyVisualizer.refresh()
    });
  }
}
