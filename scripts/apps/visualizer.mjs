/**
 * The Hotkey Visualizer window: a roomy, resizable ApplicationV2 that lists every
 * keybinding available to the player, grouped by source, with key/modifier chips
 * and condition badges. Honors the per-keybind visibility toggles.
 */

import { MODULE_ID } from "../constants.mjs";
import { collectKeybindings } from "../keybindings.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class HotkeyVisualizer extends HandlebarsApplicationMixin(ApplicationV2) {

  /** @type {HotkeyVisualizer|null} Singleton instance. */
  static #instance = null;

  /** @override */
  static DEFAULT_OPTIONS = {
    id: "hotkey-visualizer-window",
    classes: ["hotkey-visualizer", "hotkey-visualizer-window"],
    tag: "div",
    window: {
      title: "HOTKEYVIS.WindowTitle",
      icon: "fa-solid fa-keyboard",
      resizable: true
    },
    position: {
      width: 720,
      height: 640
    }
  };

  /** @override */
  static PARTS = {
    body: {
      template: `modules/${MODULE_ID}/templates/visualizer.hbs`,
      scrollable: [".hotkey-visualizer-list"]
    }
  };

  /** Open the singleton, or bring it to the front if already open. */
  static open() {
    if ( !this.#instance ) this.#instance = new this();
    this.#instance.render({ force: true });
    return this.#instance;
  }

  /** Toggle the singleton open/closed (used by the floating button). */
  static toggle() {
    if ( this.#instance?.rendered ) this.#instance.close();
    else this.open();
  }

  /** Re-render the window if it is currently open (e.g. after a toggle change). */
  static refresh() {
    if ( this.#instance?.rendered ) this.#instance.render({ parts: ["body"] });
  }

  /** @override */
  async _prepareContext(_options) {
    const { groups, total, hidden } = collectKeybindings({ respectVisibility: true });
    return {
      groups,
      total,
      hidden,
      shown: total - hidden,
      empty: groups.length === 0
    };
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    const search = this.element.querySelector('[data-action="search"]');
    if ( search ) search.addEventListener("input", this.#onSearch.bind(this));
  }

  /** Live-filter rendered rows by action name / hint. */
  #onSearch(event) {
    const query = event.currentTarget.value.trim().toLowerCase();
    const rows = this.element.querySelectorAll(".hotkey-visualizer-row");
    for ( const row of rows ) {
      const haystack = (row.dataset.search ?? "").toLowerCase();
      row.classList.toggle("hidden", query.length > 0 && !haystack.includes(query));
    }
    // Hide group sections that have no visible rows.
    for ( const section of this.element.querySelectorAll(".hotkey-visualizer-group") ) {
      const anyVisible = section.querySelector(".hotkey-visualizer-row:not(.hidden)");
      section.classList.toggle("hidden", !anyVisible);
    }
  }

  /** @override */
  _onClose(options) {
    super._onClose(options);
    if ( HotkeyVisualizer.#instance === this ) HotkeyVisualizer.#instance = null;
  }
}
