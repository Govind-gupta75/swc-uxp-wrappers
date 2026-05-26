/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { html } from '@spectrum-web-components/base';
import { Coachmark } from '@swc-uxp-internal/coachmark/src/Coachmark.js';

import styles from './uxp-coachmark.css.js';

/**
 * UXP wrapper for `sp-coachmark`.
 *
 * ## Why this wrapper exists
 *
 * Adobe UXP's layout engine has two limitations that affect sp-coachmark:
 *
 * 1. **Custom elements inside shadow DOM render at 0x0.**
 *    `sp-button` (nav buttons) rendered through Lit's template are assigned
 *    zero dimensions by UXP, making them invisible.
 *
 * 2. **`slot[name=actions]` is never populated.**
 *    UXP does not distribute light-DOM children into named shadow slots, so
 *    `sp-action-menu[slot="actions"]` renders as an unstyled block instead of
 *    being distributed into the header.
 *
 * ## Solution — consistent across all environments (Chrome, Safari, UXP)
 *
 * Rather than branching on UXP vs. standard browser, this wrapper ALWAYS
 * replaces the Lit-rendered buttons and action menu with imperatively created
 * native elements. This produces identical output in every environment:
 *
 * - `renderActionMenu` and `renderSteps` instance properties (both set by
 *   the Coachmark constructor as arrow functions) are overridden in our
 *   constructor to return empty HTML.
 * - `renderButtons()` prototype method is overridden to return empty HTML.
 * - `_injectNativeNavButtons()` appends `sp-button` elements directly into
 *   `.footer` — these work identically when created imperatively in all envs.
 * - `_injectNativeActionButton()` builds a native three-dot trigger + dropdown
 *   by reading `sp-menu-item` children from the `[slot="actions"]` light-DOM
 *   element (works whether the container is `sp-action-menu` or a plain div).
 *
 * ## Why instance-property overrides are required
 *
 * The upstream Coachmark class sets `this.renderActionMenu` and
 * `this.renderSteps` as INSTANCE properties (arrow functions) inside the
 * constructor. Instance properties shadow prototype methods, so a prototype
 * override (`renderActionMenu() { … }`) is silently ignored. The fix is to
 * reassign the instance properties in our own constructor, after `super()`.
 */
class UxpCoachmark extends Coachmark {
    constructor() {
        super(...arguments);

        // Override instance properties set by the Coachmark constructor.
        // Native injections (below) handle both in all environments.
        this.renderActionMenu = () => html``;
        this.renderSteps      = () => html``;
    }

    static get styles() {
        return [...super.styles, styles];
    }

    // Parent layout fix ───────────────────────────────────────────────────

    /**
     * Marks the immediate parent element as positioned so that the coachmark
     * can use `position:relative` on :host without disrupting page flow.
     * Called once in `connectedCallback`; idempotent via `data-uxp-cm-fixed`.
     */
    _uxpFixParent() {
        try {
            var p = this.parentElement;
            if (!p || p.hasAttribute('data-uxp-cm-fixed')) return;
            p.setAttribute('data-uxp-cm-fixed', '');
            var cur = (p.getAttribute('style') || '').replace(/;+$/, '');
            var addition = 'position:relative;overflow:visible';
            p.setAttribute('style', cur ? cur + ';' + addition : addition);
        } catch (_) {}
    }

    // Shadow-DOM injection helpers ────────────────────────────────────────

    /**
     * Appends a native nav-bar (`sp-button` pair + optional step counter) to
     * the coachmark's shadow `.footer`.
     *
     * `sp-button` elements created imperatively work correctly in all
     * environments (Chrome, Safari, UXP). Only Lit-managed `sp-button` elements
     * inside shadow DOM are zero-sized in UXP.
     */
    _injectNativeNavButtons() {
        try {
            if (this._uxpNavBar) return;

            var primary   = this.primaryCTA;
            var secondary = this.secondaryCTA;
            if (!primary && !secondary) return;

            var r = this.shadowRoot || this.renderRoot;
            if (!r) return;

            var footer = r.querySelector('.footer');
            if (!footer) return;

            var self = this;

            var bar = document.createElement('div');
            bar.setAttribute('data-uxp-nav-bar', '');
            // Layout styled via [data-uxp-nav-bar] rule in #uxp-cm-fix.

            // Step counter ("2 of 8") or spacer — both styled via
            // [data-uxp-nav-bar]>span rule in #uxp-cm-fix (flex:1 + color).
            if (this.currentStep != null && this.totalSteps > 1) {
                var stepsEl = document.createElement('span');
                stepsEl.textContent = this.currentStep + ' of ' + this.totalSteps;
                bar.appendChild(stepsEl);
            } else {
                bar.appendChild(document.createElement('span'));
            }

            if (secondary) {
                var secBtn = document.createElement('sp-button');
                secBtn.setAttribute('treatment', 'outline');
                secBtn.setAttribute('variant', 'secondary');
                secBtn.setAttribute('size', 's');
                // Gap to primary button — styled via [data-uxp-sec-btn] in #uxp-cm-fix.
                secBtn.setAttribute('data-uxp-sec-btn', '');
                secBtn.textContent = secondary;
                secBtn.addEventListener('click', function() {
                    self.dispatchEvent(new Event('secondary', { bubbles: true, composed: true }));
                });
                bar.appendChild(secBtn);
            }

            if (primary) {
                var priBtn = document.createElement('sp-button');
                priBtn.setAttribute('treatment', 'outline');
                priBtn.setAttribute('variant', 'primary');
                priBtn.setAttribute('size', 's');
                priBtn.textContent = primary;
                priBtn.addEventListener('click', function() {
                    self.dispatchEvent(new Event('primary', { bubbles: true, composed: true }));
                });
                bar.appendChild(priBtn);
            }

            footer.appendChild(bar);
            this._uxpNavBar = bar;
        } catch (_) {}
    }

    /**
     * Builds a native three-dot trigger + dropdown and appends it to
     * shadow `.static-item`.
     *
     * Reads `sp-menu-item` children from the `[slot="actions"]` light-DOM
     * element (works with both `<sp-action-menu slot="actions">` and a plain
     * `<div slot="actions">`). The original light-DOM element is moved
     * off-screen so its white-box artefact disappears while its children
     * remain queryable.
     */
    _injectNativeActionButton() {
        try {
            if (this._uxpActionBtn) return;

            var r = this.shadowRoot || this.renderRoot;
            if (!r) return;

            var actionMenu = this.querySelector('[slot="actions"]');
            var menuItems = actionMenu
                ? Array.from(actionMenu.querySelectorAll('sp-menu-item'))
                : [];

            if (!menuItems.length) return;

            // Move the source element off-screen so its white-box artefact
            // disappears while its sp-menu-item children remain accessible.
            try {
                if (actionMenu) {
                    actionMenu.style.cssText =
                        'position:fixed;left:-9999px;top:-9999px;' +
                        'width:0;height:0;overflow:hidden;pointer-events:none;';
                }
            } catch (_) {}

            var self = this;
            var open = false;
            var staticItem = r.querySelector('.static-item');

            // Three-dot trigger ──────────────────────────────────────────

            var btn = document.createElement('div');
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('data-uxp-native-btn', '');
            // Layout/visual styled via [data-uxp-native-btn] rule in #uxp-cm-fix.
            btn.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"' +
                ' viewBox="0 0 18 18" style="display:block;pointer-events:none">' +
                '<circle cx="3.5"  cy="9" r="1.5" fill="currentColor"/>' +
                '<circle cx="9"    cy="9" r="1.5" fill="currentColor"/>' +
                '<circle cx="14.5" cy="9" r="1.5" fill="currentColor"/>' +
                '</svg>';
            btn.addEventListener('mouseenter', function() {
                btn.style.backgroundColor = 'rgba(0,0,0,0.08)';
            });
            btn.addEventListener('mouseleave', function() {
                btn.style.backgroundColor = '';
            });

            // Dropdown ───────────────────────────────────────────────────
            // Wrapped with btn inside a `position:relative` container so that
            // `top:100%` always places the dropdown BELOW the trigger.

            var dropdown = document.createElement('div');
            dropdown.setAttribute('data-uxp-native-dropdown', '');
            // Visual styles (border, background, radius) via
            // [data-uxp-native-dropdown] rule in #uxp-cm-fix.
            // overflow:visible is required: UXP reports width/height as 0 via
            // getComputedStyle until layout fully settles; hidden would clip all
            // content. display/position/z-index stay inline so JS can toggle them.
            dropdown.style.cssText = [
                'display:none',
                'position:absolute',
                'right:0',
                'top:100%',
                'margin-top:4px',
                'width:auto',
                'min-width:140px',
                'z-index:200',
                'overflow:visible',
            ].join(';');

            menuItems.forEach(function(item) {
                var li = document.createElement('div');
                li.setAttribute('role', 'button');
                li.setAttribute('tabindex', '0');
                // Base visual styles via [data-uxp-native-dropdown]>div in #uxp-cm-fix.
                li.textContent = (item.textContent || '').trim();
                li.addEventListener('mouseenter', function() {
                    li.style.backgroundColor = 'rgba(0,0,0,0.05)';
                });
                li.addEventListener('mouseleave', function() {
                    li.style.backgroundColor = '';
                });
                li.addEventListener('click', function() {
                    try { item.click(); } catch (_) {}
                    open = false;
                    dropdown.style.display = 'none';
                });
                dropdown.appendChild(li);
            });

            if (!staticItem) return;

            var btnWrap = document.createElement('div');
            btnWrap.setAttribute('data-uxp-action-wrap', '');
            // position + display must be inline: CSS-rule equivalent is unreliable
            // on dynamically sized divs in UXP — wrong display causes event-order
            // issues (toggle fires before close-handler, re-opening the dropdown).
            btnWrap.style.cssText = 'position:relative;display:inline-flex;';
            btnWrap.appendChild(btn);
            btnWrap.appendChild(dropdown);

            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                open = !open;
                dropdown.style.display = open ? 'block' : 'none';
            });

            // Outside-click handler ──────────────────────────────────────
            // Registered on window in capture phase so it fires for all clicks
            // regardless of shadow-DOM boundaries.
            //
            // Two-layer inside-check:
            //   1. composedPath() — works in standard browsers; includes shadow
            //      elements so we can check btnWrap directly.
            //   2. e.target retargeting (UXP fallback) — in UXP, composedPath()
            //      may return an empty / incomplete list for shadow-DOM events.
            //      However, spec-compliant retargeting still sets e.target to
            //      the shadow HOST (self) for any click that originates inside
            //      the shadow root.  Treating e.target === self as "inside" is
            //      therefore the correct UXP fallback.
            var closeHandler = function(e) {
                if (!open) return;
                var path = e.composedPath ? e.composedPath() : [];
                // Standard check (Chrome, Safari).
                if (path.indexOf(btnWrap) !== -1) return;
                // UXP fallback: clicks inside shadow DOM have e.target retargeted
                // to the host element; treat those as "inside" clicks.
                if (e.target === self) return;
                open = false;
                dropdown.style.display = 'none';
            };
            window.addEventListener('mousedown', closeHandler, true);
            window.addEventListener('click',     closeHandler, true);
            this._uxpCloseDropdown = closeHandler;

            staticItem.appendChild(btnWrap);

            this._uxpActionBtn = btnWrap;
        } catch (_) {}
    }

    // Lifecycle ───────────────────────────────────────────────────────────

    connectedCallback() {
        super.connectedCallback();
        this._uxpFixParent();
        // Re-inject native elements if the component is reconnected after being
        // removed from the DOM (firstUpdated does not fire again on reconnect).
        if (this.hasUpdated) {
            var self = this;
            setTimeout(function() {
                self._injectNativeActionButton();
                self._injectNativeNavButtons();
            }, 0);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback && super.disconnectedCallback();
        if (this._uxpCloseDropdown) {
            window.removeEventListener('mousedown', this._uxpCloseDropdown, true);
            window.removeEventListener('click',     this._uxpCloseDropdown, true);
            this._uxpCloseDropdown = null;
        }
        [this._uxpNavBar, this._uxpActionBtn].forEach(function(el) {
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });
        this._uxpNavBar    = null;
        this._uxpActionBtn = null;
    }

    // Render overrides ────────────────────────────────────────────────────

    /**
     * Always return empty HTML. Native injection handles buttons in all envs.
     *
     * Note: `renderActionMenu` and `renderSteps` are overridden as INSTANCE
     * properties in the constructor (they are arrow functions set by the
     * Coachmark constructor). A prototype-level override would be silently
     * ignored because instance properties take precedence over prototype methods.
     */
    renderButtons() {
        return html``;
    }

    firstUpdated(changedProperties) {
        super.firstUpdated && super.firstUpdated(changedProperties);

        // Inject critical CSS overrides into the shadow root once.
        // `!important` is required because UXP's UA stylesheet can override
        // component styles in ways that standard browsers do not.
        try {
            var root = this.shadowRoot || this.renderRoot;
            if (root && !root.querySelector('#uxp-cm-fix')) {
                var s = document.createElement('style');
                s.id = 'uxp-cm-fix';
                // Visual/layout rules for imperatively injected elements.
                // Using a <style> tag (not adoptedStyleSheets) so rules apply
                // to elements appended after initial render (UXP §2).
                // Positional / JS-toggled properties (display:none, position,
                // z-index) stay on inline styles so JS can mutate them freely.
                //
                // --uxp-cm-* tokens are defined once on :host and referenced
                // by all descendant rules below.  This eliminates literal
                // duplication and lets consumers override values on :host.
                // --mod-coachmark-border-radius / --mod-coachmark-border-size
                // are already defined by uxp-coachmark.css (adoptedStyleSheets)
                // and cascade into these rules because both live in the same
                // shadow root.
                s.textContent =
                    ':host{' +
                        'display:flex!important;' +
                        'flex-direction:column!important;' +
                        'position:relative!important;' +
                        'overflow:visible!important;' +
                        // Design tokens — single source of truth for all rules below.
                        '--uxp-cm-font-size:14px;' +
                        '--uxp-cm-btn-size:32px;' +
                        '--uxp-cm-step-color:#555;' +
                        '--uxp-cm-menu-bg:#fff;' +
                        '--uxp-cm-menu-border-color:rgba(0,0,0,0.15);' +
                        '--uxp-cm-menu-text-color:#222;' +
                    '}' +
                    '.footer{' +
                        'overflow:visible!important;' +
                        'display:flex!important;' +
                        'flex-direction:column!important;' +
                    '}' +
                    '[data-uxp-nav-bar]{' +
                        'display:flex;' +
                        'flex-direction:row;' +
                        'align-items:center;' +
                        'width:100%;' +
                        'padding:8px 12px;' +
                        'box-sizing:border-box;' +
                    '}' +
                    '[data-uxp-nav-bar]>span{' +
                        'flex:1;' +
                        'font-size:var(--uxp-cm-font-size);' +
                        'color:var(--uxp-cm-step-color);' +
                    '}' +
                    // Gap between secondary and primary buttons.
                    '[data-uxp-sec-btn]{margin-right:8px;}' +
                    '[data-uxp-native-btn]{' +
                        'width:var(--uxp-cm-btn-size);' +
                        'height:var(--uxp-cm-btn-size);' +
                        'display:inline-flex;' +
                        'align-items:center;' +
                        'justify-content:center;' +
                        'cursor:pointer;' +
                        // Reuse the border-radius token already defined in uxp-coachmark.css.
                        'border-radius:var(--mod-coachmark-border-radius,4px);' +
                        'flex-shrink:0;' +
                        'transition:background-color 0.15s;' +
                    '}' +
                    '[data-uxp-native-dropdown]{' +
                        'background-color:var(--uxp-cm-menu-bg);' +
                        // Reuse border-size token from uxp-coachmark.css.
                        'border:var(--mod-coachmark-border-size,1px) solid var(--uxp-cm-menu-border-color);' +
                        'border-radius:var(--mod-coachmark-border-radius,4px);' +
                    '}' +
                    '[data-uxp-native-dropdown]>div{' +
                        'display:block;' +
                        'padding:8px 16px;' +
                        'cursor:pointer;' +
                        'font-size:var(--uxp-cm-font-size);' +
                        'color:var(--uxp-cm-menu-text-color);' +
                        'white-space:nowrap;' +
                    '}';
                root.appendChild(s);
            }
        } catch (_) {}

        // Inject native elements after Lit's first render settles.
        // Using imperatively created elements (not Lit templates) ensures
        // identical behaviour in Chrome, Safari, and UXP.
        var self = this;
        setTimeout(function() {
            self._injectNativeActionButton();
            self._injectNativeNavButtons();
        }, 200);
    }
}

export { UxpCoachmark as Coachmark };
