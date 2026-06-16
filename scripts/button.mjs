/**
 * Floating launcher button for the Hotkey Visualizer window.
 *
 * Rather than registering a fragile custom sidebar tab, we inject our own button
 * anchored to the bottom-left of the viewport, just to the right of the players
 * list. Position is nudged by client-scoped pixel-offset settings.
 */

import { MODULE_ID, SETTINGS } from "./constants.mjs";
import { HotkeyVisualizer } from "./apps/visualizer.mjs";

const BUTTON_ID = "hotkey-visualizer-button";

/**
 * Create the floating button once and attach it to the document body. Safe to call
 * repeatedly (e.g. on every `renderPlayers`) — it no-ops if the button already exists.
 */
export function injectButton() {
  if ( document.getElementById(BUTTON_ID) ) {
    repositionButton();
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.id = BUTTON_ID;
  button.classList.add("hotkey-visualizer-button");
  button.setAttribute("aria-label", game.i18n.localize("HOTKEYVIS.ButtonTooltip"));
  button.dataset.tooltip = game.i18n.localize("HOTKEYVIS.ButtonTooltip");
  button.innerHTML = '<i class="fa-solid fa-keyboard"></i>';
  button.addEventListener("click", () => HotkeyVisualizer.toggle());

  document.body.appendChild(button);
  repositionButton();
}

/**
 * Position the button just to the right of the players list, applying the
 * configured pixel offsets. Falls back to a fixed corner anchor if the players
 * list is not present.
 */
export function repositionButton() {
  const button = document.getElementById(BUTTON_ID);
  if ( !button ) return;

  const offsetX = Number(game.settings.get(MODULE_ID, SETTINGS.BUTTON_OFFSET_X)) || 0;
  const offsetY = Number(game.settings.get(MODULE_ID, SETTINGS.BUTTON_OFFSET_Y)) || 0;

  const players = document.getElementById("players");
  const gap = 8;
  let baseLeft = gap;
  let baseBottom = gap;

  if ( players ) {
    const rect = players.getBoundingClientRect();
    // Default to twice the distance from the left edge so the button sits clearly to
    // the right of the players list. Fine-tune with the X offset setting.
    baseLeft = (rect.right + gap) * 2;
    baseBottom = window.innerHeight - rect.bottom;
  }

  button.style.left = `${baseLeft + offsetX}px`;
  button.style.bottom = `${baseBottom + offsetY}px`;
}

/** Remove the button (used on teardown / disable). */
export function removeButton() {
  document.getElementById(BUTTON_ID)?.remove();
}
