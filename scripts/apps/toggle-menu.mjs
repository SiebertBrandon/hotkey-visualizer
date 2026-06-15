/**
 * The single "toggle list" settings menu: one checkbox per keybind controlling
 * whether it appears in the visualizer. Each checkbox is bound to that keybind's
 * individual client-scoped visibility setting, so Nik's Settings Locks can lock
 * any of them. Locked inputs are disabled by Nik's at runtime.
 */

import { MODULE_ID, showSettingKey } from "../constants.mjs";
import { collectKeybindings } from "../keybindings.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class HotkeyToggleMenu extends HandlebarsApplicationMixin(ApplicationV2) {

  /** @override */
  static DEFAULT_OPTIONS = {
    id: "hotkey-visualizer-toggle-menu",
    classes: ["hotkey-visualizer", "hotkey-visualizer-toggle-menu"],
    tag: "form",
    window: {
      title: "HOTKEYVIS.Settings.ToggleMenu.Name",
      icon: "fa-solid fa-keyboard",
      resizable: true
    },
    position: {
      width: 560,
      height: 620
    },
    form: {
      handler: HotkeyToggleMenu.#onSubmit,
      closeOnSubmit: true
    },
    actions: {
      selectAll: HotkeyToggleMenu.#onSelectAll,
      selectNone: HotkeyToggleMenu.#onSelectNone
    }
  };

  /** @override */
  static PARTS = {
    body: {
      template: `modules/${MODULE_ID}/templates/toggle-menu.hbs`,
      scrollable: [".hotkey-visualizer-list"]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  };

  /** @override */
  async _prepareContext(_options) {
    const { groups } = collectKeybindings({ respectVisibility: false });
    return {
      groups,
      buttons: [
        { type: "submit", icon: "fa-solid fa-floppy-disk", label: "HOTKEYVIS.Save" }
      ]
    };
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    const search = this.element.querySelector('[data-action="search"]');
    if ( search ) search.addEventListener("input", this.#onSearch.bind(this));
  }

  /** Live-filter the toggle rows. */
  #onSearch(event) {
    const query = event.currentTarget.value.trim().toLowerCase();
    for ( const row of this.element.querySelectorAll(".hotkey-visualizer-toggle-row") ) {
      const haystack = (row.dataset.search ?? "").toLowerCase();
      row.classList.toggle("hidden", query.length > 0 && !haystack.includes(query));
    }
  }

  /** Bulk-select helpers respect Nik's locks (disabled inputs are skipped). */
  static #onSelectAll() {
    this.#setAllVisible(true);
  }

  static #onSelectNone() {
    this.#setAllVisible(false);
  }

  #setAllVisible(value) {
    for ( const input of this.element.querySelectorAll('input[type="checkbox"]:not([disabled])') ) {
      input.checked = value;
    }
  }

  /**
   * Persist every checkbox to its individual visibility setting.
   * @this {HotkeyToggleMenu}
   * @param {SubmitEvent} _event
   * @param {HTMLFormElement} _form
   * @param {object} formData
   */
  static async #onSubmit(_event, _form, formData) {
    const data = formData.object;
    const { groups } = collectKeybindings({ respectVisibility: false });
    const updates = [];
    for ( const group of groups ) {
      for ( const action of group.actions ) {
        const key = showSettingKey(action.actionId);
        // Unchecked checkboxes are absent from formData; coerce to boolean.
        const value = data[key] === true;
        if ( value !== action.visible ) {
          updates.push(game.settings.set(MODULE_ID, key, value));
        }
      }
    }
    await Promise.all(updates);
  }
}
