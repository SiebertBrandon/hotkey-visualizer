/** Shared constants for the Hotkey Visualizer module. */

export const MODULE_ID = "hotkey-visualizer";

/** Setting keys used by the module. */
export const SETTINGS = {
  /** Prefix for the per-keybind visibility settings: `show:<sanitizedActionId>`. */
  SHOW_PREFIX: "show:",
  /** Whether the per-keybind settings are shown in the core Configure Settings window. */
  EXPOSE_INDIVIDUAL: "exposeIndividualSettings",
  /** Horizontal pixel offset of the floating button from its anchor. */
  BUTTON_OFFSET_X: "buttonOffsetX",
  /** Vertical pixel offset of the floating button from its anchor. */
  BUTTON_OFFSET_Y: "buttonOffsetY"
};

/**
 * Sanitize a namespaced keybinding action id into a setting-key-safe suffix.
 * Action ids look like "core.target" or "my-module.doThing"; we keep them readable
 * but strip characters that are awkward inside a `module.key` settings path.
 * @param {string} actionId
 * @returns {string}
 */
export function sanitizeActionId(actionId) {
  return actionId.replace(/[^A-Za-z0-9_-]/g, "_");
}

/**
 * Build the full per-keybind visibility setting key for an action id.
 * @param {string} actionId
 * @returns {string}
 */
export function showSettingKey(actionId) {
  return `${SETTINGS.SHOW_PREFIX}${sanitizeActionId(actionId)}`;
}
