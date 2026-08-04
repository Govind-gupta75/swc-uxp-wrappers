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

/**
 * UXP-safe fork of @spectrum-web-components/shared/src/focusable.ts (v1.12.1),
 * ported to plain JS since this repo has no decorator/TS build support —
 * `@property()` becomes a non-decorator `static properties` declaration,
 * which Lit wraps around the getter/setter below without changing behavior
 * (see https://lit.dev/docs/components/properties/#accessors).
 *
 * UXP-24418 fix: the `tabIndex` getter reads `this.focusElement.tabIndex`
 * live (v0.37.0 behavior) instead of upstream v1.12.x's cached `_tabIndex`,
 * which broke Tab-key focus traversal in the UXP plugin host for components
 * that delegate focus to a shadow-DOM child (Link, Checkbox, etc.).
 */
import { SpectrumElement } from '@spectrum-web-components/base';
import { FocusVisiblePolyfillMixin } from '@swc-uxp-internal/shared/src/focus-visible.js';

function nextFrame() {
    return new Promise((res) => requestAnimationFrame(() => res()));
}

/**
 * Focusable base class handles tabindex setting into shadowed elements automatically.
 *
 * This implementation is based heavily on the aybolit delegate-focus-mixin at
 * https://github.com/web-padawan/aybolit/blob/master/packages/core/src/mixins/delegate-focus-mixin.js
 */
export class Focusable extends FocusVisiblePolyfillMixin(SpectrumElement) {
    static properties = {
        /**
         * Disable this control. It will not receive focus or events
         */
        disabled: { type: Boolean, reflect: true },
        /**
         * When this control is rendered, focus it automatically
         *
         * @private
         */
        autofocus: { type: Boolean },
        /**
         * The tab index to apply to this control. See general documentation about
         * the tabindex HTML property
         *
         * @private
         */
        tabIndex: { type: Number },
    };

    manipulatingTabindex = false;
    autofocusReady = Promise.resolve();
    _tabIndex = 0;

    constructor() {
        super();
        // `disabled`/`autofocus` are reactive properties (see `static properties`
        // above) — assigning their defaults here, rather than as class fields,
        // avoids shadowing the accessors Lit installs on the prototype.
        // https://lit.dev/msg/class-field-shadowing
        this.disabled = false;
        this.autofocus = false;
    }

    get tabIndex() {
        if (this.focusElement === this) {
            const tabindex = this.hasAttribute('tabindex')
                ? Number(this.getAttribute('tabindex'))
                : NaN;
            return !isNaN(tabindex) ? tabindex : -1;
        }
        const tabIndexAttribute = parseFloat(
            this.hasAttribute('tabindex') ? this.getAttribute('tabindex') || '0' : '0'
        );
        // When `disabled` tabindex is -1.
        // When host tabindex -1, use that as the cache.
        if (this.disabled || tabIndexAttribute < 0) {
            return -1;
        }
        // When `focusElement` isn't available yet,
        // use host tabindex as the cache.
        if (!this.focusElement) {
            return tabIndexAttribute;
        }
        // UXP-24418: read live off `focusElement` rather than the `_tabIndex`
        // cache upstream uses (see file header).
        return this.focusElement.tabIndex;
    }

    set tabIndex(tabIndex) {
        // Flipping `manipulatingTabindex` to true before a change
        // allows for that change NOT to effect the cached value of tabindex
        if (this.manipulatingTabindex) {
            this.manipulatingTabindex = false;
            return;
        }

        if (this.focusElement === this) {
            if (this.disabled) {
                this._tabIndex = tabIndex;
            } else if (tabIndex !== this._tabIndex) {
                this._tabIndex = tabIndex;
                const tabindex = '' + tabIndex;
                this.manipulatingTabindex = true;
                this.setAttribute('tabindex', tabindex);
            }
            return;
        }

        if (tabIndex === -1) {
            this.addEventListener('pointerdown', this.onPointerdownManagementOfTabIndex);
        } else {
            // All code paths are about to address the host tabindex without side effect.
            this.manipulatingTabindex = true;
            this.removeEventListener('pointerdown', this.onPointerdownManagementOfTabIndex);
        }

        if (tabIndex === -1 || this.disabled) {
            this.manipulatingTabindex = true;
            this.setAttribute('tabindex', '-1');
            this.removeAttribute('focusable');

            if (this.selfManageFocusElement) {
                return;
            }

            if (tabIndex !== -1) {
                this._tabIndex = tabIndex;
                this.manageFocusElementTabindex(tabIndex);
            } else {
                this.focusElement?.removeAttribute('tabindex');
            }
            return;
        }

        this.setAttribute('focusable', '');
        if (this.hasAttribute('tabindex')) {
            this.removeAttribute('tabindex');
        } else {
            // You can't remove an attribute that isn't there,
            // manually end the `manipulatingTabindex` guard.
            this.manipulatingTabindex = false;
        }

        this._tabIndex = tabIndex;
        this.manageFocusElementTabindex(tabIndex);
    }

    onPointerdownManagementOfTabIndex() {
        if (this.tabIndex === -1) {
            setTimeout(() => {
                // Ensure this happens _after_ WebKit attempts to focus the :host.
                this.tabIndex = 0;
                this.focus({ preventScroll: true });
                this.tabIndex = -1;
            });
        }
    }

    async manageFocusElementTabindex(tabIndex) {
        if (!this.focusElement) {
            // allow setting these values to be async when needed.
            await this.updateComplete;
        }
        if (tabIndex === null) {
            this.focusElement.removeAttribute('tabindex');
        } else {
            if (this.focusElement !== this) {
                this.focusElement.tabIndex = tabIndex;
            }
        }
    }

    /**
     * @private
     */
    get focusElement() {
        throw new Error('Must implement focusElement getter!');
    }

    /**
     * @public
     * @returns {boolean} whether the component should manage its focusElement tab-index or not
     * Needed for action-menu to be supported in action-group in an accessible way
     */
    get selfManageFocusElement() {
        return false;
    }

    focus(options) {
        if (this.disabled || !this.focusElement) {
            return;
        }

        if (this.focusElement !== this) {
            this.focusElement.focus(options);
        } else {
            HTMLElement.prototype.focus.apply(this, [options]);
        }
    }

    blur() {
        const focusElement = this.focusElement || this;
        if (focusElement !== this) {
            focusElement.blur();
        } else {
            HTMLElement.prototype.blur.apply(this);
        }
    }

    click() {
        if (this.disabled) {
            return;
        }

        const focusElement = this.focusElement || this;
        if (focusElement !== this) {
            focusElement.click();
        } else {
            HTMLElement.prototype.click.apply(this);
        }
    }

    manageAutoFocus() {
        if (this.autofocus) {
            /**
             * Trick :focus-visible polyfill into thinking keyboard based focus
             *
             * @private
             **/
            this.dispatchEvent(
                new KeyboardEvent('keydown', {
                    code: 'Tab',
                })
            );
            this.focusElement.focus();
        }
    }

    firstUpdated(changes) {
        super.firstUpdated(changes);
        if (!this.hasAttribute('tabindex') || this.getAttribute('tabindex') !== '-1') {
            this.setAttribute('focusable', '');
        }
    }

    update(changedProperties) {
        if (changedProperties.has('disabled')) {
            this.handleDisabledChanged(this.disabled, changedProperties.get('disabled'));
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        if (changedProperties.has('disabled') && this.disabled) {
            this.blur();
        }
    }

    async handleDisabledChanged(disabled, oldDisabled) {
        const canSetDisabled = () =>
            this.focusElement !== this && typeof this.focusElement.disabled !== 'undefined';
        if (disabled) {
            this.manipulatingTabindex = true;
            this.setAttribute('tabindex', '-1');
            await this.updateComplete;
            if (canSetDisabled()) {
                this.focusElement.disabled = true;
            } else {
                this.setAttribute('aria-disabled', 'true');
            }
        } else if (oldDisabled) {
            this.manipulatingTabindex = true;
            if (this.focusElement === this) {
                this.setAttribute('tabindex', '' + this._tabIndex);
            } else {
                this.removeAttribute('tabindex');
            }
            await this.updateComplete;
            if (canSetDisabled()) {
                this.focusElement.disabled = false;
            } else {
                this.removeAttribute('aria-disabled');
            }
        }
    }

    async getUpdateComplete() {
        const complete = await super.getUpdateComplete();
        await this.autofocusReady;
        return complete;
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.autofocus) {
            // If at connect time the [autofocus] content is placed within
            // content that needs to be "hidden" by default, it would need to wait
            // two rAFs for animations to be triggered on that content in
            // order for the [autofocus] to become "visible" and have its
            // focus() capabilities enabled.
            //
            // Await this with `getUpdateComplete` so that the element cannot
            // become "ready" until `manageFocus` has occurred.
            this.autofocusReady = (async () => {
                await nextFrame();
                await nextFrame();
            })();
            this.updateComplete.then(() => {
                this.manageAutoFocus();
            });
        }
    }
}
