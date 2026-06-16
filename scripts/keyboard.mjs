/**
 * Builds a QWERTY keyboard + mouse visualization annotated with the player's
 * keybindings. Keys that have a binding are flagged so the template can highlight
 * them; each carries an HTML tooltip listing the bound actions and their modifiers.
 */

import { collectKeyMap } from "./keybindings.mjs";

/**
 * Static ANSI QWERTY layout. Each key declares its `KeyboardEvent.code` (matching the
 * values Foundry stores in keybindings) and a display `label`. `width` is a flex unit
 * (1 = standard key). `gap` entries are spacers between key clusters.
 */
const KEY_ROWS = [
  [
    { code: "Escape", label: "Esc", width: 1.4 }, { gap: true, width: 0.6 },
    { code: "F1", label: "F1" }, { code: "F2", label: "F2" }, { code: "F3", label: "F3" }, { code: "F4", label: "F4" },
    { gap: true, width: 0.4 },
    { code: "F5", label: "F5" }, { code: "F6", label: "F6" }, { code: "F7", label: "F7" }, { code: "F8", label: "F8" },
    { gap: true, width: 0.4 },
    { code: "F9", label: "F9" }, { code: "F10", label: "F10" }, { code: "F11", label: "F11" }, { code: "F12", label: "F12" }
  ],
  [
    { code: "Backquote", label: "`" }, { code: "Digit1", label: "1" }, { code: "Digit2", label: "2" },
    { code: "Digit3", label: "3" }, { code: "Digit4", label: "4" }, { code: "Digit5", label: "5" },
    { code: "Digit6", label: "6" }, { code: "Digit7", label: "7" }, { code: "Digit8", label: "8" },
    { code: "Digit9", label: "9" }, { code: "Digit0", label: "0" }, { code: "Minus", label: "-" },
    { code: "Equal", label: "=" }, { code: "Backspace", label: "Bksp", width: 2 }
  ],
  [
    { code: "Tab", label: "Tab", width: 1.5 }, { code: "KeyQ", label: "Q" }, { code: "KeyW", label: "W" },
    { code: "KeyE", label: "E" }, { code: "KeyR", label: "R" }, { code: "KeyT", label: "T" },
    { code: "KeyY", label: "Y" }, { code: "KeyU", label: "U" }, { code: "KeyI", label: "I" },
    { code: "KeyO", label: "O" }, { code: "KeyP", label: "P" }, { code: "BracketLeft", label: "[" },
    { code: "BracketRight", label: "]" }, { code: "Backslash", label: "\\", width: 1.5 }
  ],
  [
    { code: "CapsLock", label: "Caps", width: 1.8 }, { code: "KeyA", label: "A" }, { code: "KeyS", label: "S" },
    { code: "KeyD", label: "D" }, { code: "KeyF", label: "F" }, { code: "KeyG", label: "G" },
    { code: "KeyH", label: "H" }, { code: "KeyJ", label: "J" }, { code: "KeyK", label: "K" },
    { code: "KeyL", label: "L" }, { code: "Semicolon", label: ";" }, { code: "Quote", label: "'" },
    { code: "Enter", label: "Enter", width: 2.2 }
  ],
  [
    { code: "ShiftLeft", label: "Shift", width: 2.3 }, { code: "KeyZ", label: "Z" }, { code: "KeyX", label: "X" },
    { code: "KeyC", label: "C" }, { code: "KeyV", label: "V" }, { code: "KeyB", label: "B" },
    { code: "KeyN", label: "N" }, { code: "KeyM", label: "M" }, { code: "Comma", label: "," },
    { code: "Period", label: "." }, { code: "Slash", label: "/" }, { code: "ShiftRight", label: "Shift", width: 2.7 }
  ],
  [
    { code: "ControlLeft", label: "Ctrl", width: 1.5 }, { code: "MetaLeft", label: "Meta", width: 1.25 },
    { code: "AltLeft", label: "Alt", width: 1.25 }, { code: "Space", label: "Space", width: 6 },
    { code: "AltRight", label: "Alt", width: 1.25 }, { code: "ControlRight", label: "Ctrl", width: 1.5 }
  ]
];

/** Navigation / arrow cluster shown to the right of the main block. */
const NAV_ROWS = [
  [ { code: "Insert", label: "Ins" }, { code: "Home", label: "Home" }, { code: "PageUp", label: "PgUp" } ],
  [ { code: "Delete", label: "Del" }, { code: "End", label: "End" }, { code: "PageDown", label: "PgDn" } ],
  [ { gap: true }, { gap: true }, { gap: true } ],
  [ { gap: true }, { code: "ArrowUp", label: "↑" }, { gap: true } ],
  [ { code: "ArrowLeft", label: "←" }, { code: "ArrowDown", label: "↓" }, { code: "ArrowRight", label: "→" } ]
];

/** Mouse buttons. Foundry rarely binds these, but the codes are checked just in case. */
const MOUSE_BUTTONS = [
  { codes: ["Mouse1", "MouseLeft"], label: "Left", cls: "mouse-left" },
  { codes: ["Mouse2", "MouseMiddle"], label: "Middle", cls: "mouse-middle" },
  { codes: ["Mouse3", "MouseRight"], label: "Right", cls: "mouse-right" },
  { codes: ["WheelUp", "MouseWheelUp"], label: "Wheel ↑", cls: "mouse-wheel-up" },
  { codes: ["WheelDown", "MouseWheelDown"], label: "Wheel ↓", cls: "mouse-wheel-down" }
];

/**
 * @returns {{rows: Array, nav: Array, mouse: Array, anyBound: boolean}}
 */
export function buildKeyboardView() {
  const keyMap = collectKeyMap();
  let anyBound = false;

  const annotate = (key) => {
    if ( key.gap ) return { gap: true, width: key.width ?? 1 };
    const binds = keyMap.get(key.code) ?? [];
    if ( binds.length ) anyBound = true;
    return {
      code: key.code,
      label: key.label,
      width: key.width ?? 1,
      highlighted: binds.length > 0,
      count: binds.length,
      tooltip: binds.length ? buildTooltip(binds) : ""
    };
  };

  const rows = KEY_ROWS.map(row => row.map(annotate));
  const nav = NAV_ROWS.map(row => row.map(annotate));

  const mouse = MOUSE_BUTTONS.map(btn => {
    const binds = btn.codes.flatMap(code => keyMap.get(code) ?? []);
    if ( binds.length ) anyBound = true;
    return {
      label: btn.label,
      cls: btn.cls,
      highlighted: binds.length > 0,
      tooltip: binds.length ? buildTooltip(binds) : ""
    };
  });

  return { rows, nav, mouse, anyBound };
}

/**
 * Build an HTML tooltip string for a set of bindings on one key. Stored in a
 * `data-tooltip` attribute; Foundry's tooltip manager renders it as HTML.
 * @param {Array<{name: string, modifiers: Array<{label: string}>}>} binds
 * @returns {string}
 */
function buildTooltip(binds) {
  return binds.map(b => {
    const mods = b.modifiers.map(m => escapeHtml(m.label)).join(" + ");
    const prefix = mods ? `${mods} + ` : "";
    return `<div class="hkv-kb-tip-line">${prefix}${escapeHtml(b.name)}</div>`;
  }).join("");
}

/**
 * Minimal HTML escaping for tooltip content built from localized strings.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
