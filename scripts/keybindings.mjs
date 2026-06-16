/**
 * Enumerate and normalize the game's registered keybindings into a structure
 * that the visualizer template can render. Pulls live data from
 * `game.keybindings` so it always reflects the player's current configuration.
 */

import { MODULE_ID, showSettingKey } from "./constants.mjs";

/**
 * Read a keybind's visibility setting defensively. Keybindings can be registered at
 * different lifecycle stages (core registers some after module `setup`), so a setting
 * may not exist yet for every action. Missing settings default to visible rather than
 * throwing.
 * @param {string} actionId
 * @returns {boolean}
 */
function isKeybindVisible(actionId) {
  const key = showSettingKey(actionId);
  if ( !game.settings.settings.has(`${MODULE_ID}.${key}`) ) return true;
  return game.settings.get(MODULE_ID, key) !== false;
}

/** @returns {typeof foundry.helpers.interaction.KeyboardManager} */
function getKeyboardManager() {
  return foundry.helpers?.interaction?.KeyboardManager ?? globalThis.KeyboardManager;
}

/**
 * Turn a KeyboardEvent.code-style key string into something readable.
 * Prefers Foundry's own display helper; falls back to a simple humanizer.
 * @param {string} key
 * @returns {string}
 */
function displayKey(key) {
  if ( !key ) return "—";
  const KM = getKeyboardManager();
  const fn = KM?.getKeycodeDisplayString;
  if ( typeof fn === "function" ) {
    try {
      const out = fn.call(KM, key);
      if ( out ) return out;
    } catch ( _err ) { /* fall through to manual formatting */ }
  }
  return humanizeKeyCode(key);
}

/**
 * Best-effort humanization of a physical key code when no engine helper exists.
 * @param {string} key
 * @returns {string}
 */
function humanizeKeyCode(key) {
  if ( key.startsWith("Key") ) return key.slice(3);          // KeyA -> A
  if ( key.startsWith("Digit") ) return key.slice(5);        // Digit1 -> 1
  if ( key.startsWith("Numpad") ) return `Num ${key.slice(6)}`;
  if ( key.startsWith("Arrow") ) return `${key.slice(5)} Arrow`;
  return key;
}

/**
 * Map a modifier identifier (e.g. "Control", "CONTROL", "Shift") to a chip.
 * @param {string} mod
 * @returns {{label: string, cls: string}}
 */
function modifierChip(mod) {
  const key = String(mod).toUpperCase();
  switch ( key ) {
    case "CONTROL": return { label: "Ctrl", cls: "mod-ctrl" };
    case "SHIFT": return { label: "Shift", cls: "mod-shift" };
    case "ALT": return { label: "Alt", cls: "mod-alt" };
    case "META": return { label: "Meta", cls: "mod-meta" };
    default: return { label: String(mod), cls: "mod-other" };
  }
}

/**
 * Resolve a keybinding namespace into a human-friendly source group label.
 * @param {string} namespace
 * @returns {string}
 */
function sourceLabel(namespace) {
  if ( !namespace || namespace === "core" ) return game.i18n.localize("HOTKEYVIS.SourceCore");
  if ( game.system && namespace === game.system.id ) {
    return game.system.title ?? game.system.id;
  }
  const mod = game.modules.get(namespace);
  if ( mod ) return mod.title ?? namespace;
  return namespace;
}

/**
 * Collect all registered keybindings, grouped by source, with display data and
 * the current per-keybind visibility state.
 *
 * @param {object} [options]
 * @param {boolean} [options.respectVisibility=true]  When true, omit actions whose
 *   visibility setting is false (used by the visualizer). When false, include all
 *   actions with their `visible` flag (used by the toggle menu).
 * @returns {{groups: Array, total: number, hidden: number}}
 */
export function collectKeybindings({ respectVisibility = true } = {}) {
  const actions = game.keybindings?.actions ?? new Map();
  /** @type {Map<string, {label: string, namespace: string, actions: Array}>} */
  const grouped = new Map();
  let total = 0;
  let hidden = 0;

  for ( const [actionId, config] of actions.entries() ) {
    total += 1;

    const visible = isKeybindVisible(actionId);
    if ( !visible ) hidden += 1;
    if ( respectVisibility && !visible ) continue;

    const namespace = config.namespace ?? actionId.split(".")[0] ?? "core";
    const bindings = (game.keybindings.get(namespace, actionId.slice(namespace.length + 1)) ?? [])
      .map(b => ({
        keyLabel: displayKey(b.key),
        modifiers: (b.modifiers ?? []).map(modifierChip)
      }));

    const reserved = (config.reservedModifiers ?? []).map(modifierChip);

    const entry = {
      actionId,
      settingKey: showSettingKey(actionId),
      name: config.name ? game.i18n.localize(config.name) : actionId,
      hint: config.hint ? game.i18n.localize(config.hint) : "",
      bindings,
      hasBindings: bindings.length > 0,
      reserved,
      hasReserved: reserved.length > 0,
      badges: buildBadges(config),
      visible
    };

    const groupKey = namespace || "core";
    if ( !grouped.has(groupKey) ) {
      grouped.set(groupKey, { label: sourceLabel(namespace), namespace: groupKey, actions: [] });
    }
    grouped.get(groupKey).actions.push(entry);
  }

  // Sort actions within a group by name, and groups with Core first then alphabetical.
  const groups = Array.from(grouped.values());
  for ( const g of groups ) g.actions.sort((a, b) => a.name.localeCompare(b.name));
  groups.sort((a, b) => {
    if ( a.namespace === "core" ) return -1;
    if ( b.namespace === "core" ) return 1;
    return a.label.localeCompare(b.label);
  });

  return { groups, total, hidden };
}

/**
 * Build a map of physical key codes to the visible bindings that use them, for the
 * keyboard view. Modifiers are kept with each binding so the tooltip can show e.g.
 * "Ctrl + Shift + Action".
 * @returns {Map<string, Array<{name: string, modifiers: Array<{label: string, cls: string}>}>>}
 */
export function collectKeyMap() {
  /** @type {Map<string, Array>} */
  const map = new Map();
  const actions = game.keybindings?.actions ?? new Map();

  for ( const [actionId, config] of actions.entries() ) {
    if ( !isKeybindVisible(actionId) ) continue;
    const namespace = config.namespace ?? actionId.split(".")[0] ?? "core";
    const name = config.name ? game.i18n.localize(config.name) : actionId;
    const bindings = game.keybindings.get(namespace, actionId.slice(namespace.length + 1)) ?? [];
    for ( const b of bindings ) {
      if ( !b.key ) continue;
      if ( !map.has(b.key) ) map.set(b.key, []);
      map.get(b.key).push({ name, modifiers: (b.modifiers ?? []).map(modifierChip) });
    }
  }
  return map;
}

/**
 * Build condition badges (GM-only, repeatable) for a keybinding config.
 * @param {object} config
 * @returns {Array<{label: string, cls: string}>}
 */
function buildBadges(config) {
  const badges = [];
  if ( config.restricted ) {
    badges.push({ label: game.i18n.localize("HOTKEYVIS.BadgeGM"), cls: "badge-gm" });
  }
  if ( config.repeat ) {
    badges.push({ label: game.i18n.localize("HOTKEYVIS.BadgeRepeat"), cls: "badge-repeat" });
  }
  return badges;
}
