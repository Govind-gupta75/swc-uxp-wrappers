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

import { Badge } from '@swc-uxp-internal/badge/src/Badge.js';
import { html } from '@spectrum-web-components/base';

import styles from './uxp-badge.css.js';

// Returns true for nodes that belong to the badge's default slot content:
// plain text nodes and child elements that are NOT assigned to a named slot.
// Used in both slotHasContent and _adoptText to avoid duplicating the predicate.
const _isDefaultSlotNode = (n) =>
    n.nodeType === Node.TEXT_NODE ||
    (n.nodeType === Node.ELEMENT_NODE && !n.getAttribute('slot'));

class UxpBadge extends Badge {
    static get styles() {
        return [...super.styles, styles];
    }

    get hasIcon() {
        // Check light DOM (before adoption) or shadow DOM host (after adoption)
        return !!(
            this.querySelector('[slot="icon"]') ||
            (this.shadowRoot && this.shadowRoot.querySelector('.uxp-icon-host > *'))
        );
    }

    get slotHasContent() {
        // After _adoptText() runs, light DOM is empty and truth lives in .label.
        const label = this.shadowRoot && this.shadowRoot.querySelector('.label');
        if (label && label.childNodes.length > 0) {
            return label.textContent.trim().length > 0;
        }
        // Before adoption: check light DOM directly.
        return Array.from(this.childNodes)
            .filter(_isDefaultSlotNode)
            .some((n) => (n.textContent || '').trim().length > 0);
    }

    // Upstream's ObserveSlotText mixin decorates slotHasContent with @property,
    // generating a setter that calls requestUpdate() on assignment. Without this
    // no-op override the mixin's setter would trigger an infinite update loop:
    // updated() → _adoptText() → DOM change → slotHasContent setter → requestUpdate() → …
    set slotHasContent(_v) {}

    render() {
        // No <slot> needed — both icon and text are adopted into shadow DOM
        // directly by _adoptIcon() and _adoptText(), bypassing UXP ShadyDOM
        // flat-tree ordering and slot distribution issues entirely.
        return html`
            <span class="uxp-icon-host"></span>
            <div class="label"></div>
        `;
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        this._adoptIcon();
        this._adoptText();
        this._syncIconState();
    }

    _adoptIcon() {
        const lightIcon = this.querySelector('[slot="icon"]');
        if (!lightIcon || !this.shadowRoot) return;
        const host = this.shadowRoot.querySelector('.uxp-icon-host');
        if (!host || host.contains(lightIcon)) return;
        // Move icon from light DOM into shadow DOM so it becomes a real flex item.
        host.appendChild(lightIcon);
    }

    _adoptText() {
        const label = this.shadowRoot && this.shadowRoot.querySelector('.label');
        if (!label) return;
        // Early exit: text already adopted on a prior updated() call.
        if (label.childNodes.length > 0) return;
        // Move non-slotted light DOM nodes into shadow DOM .label so they are
        // subject to shadow CSS and do not appear as stray flex items after shadow
        // DOM content (UXP ShadyDOM flat-tree limitation).
        for (const node of Array.from(this.childNodes).filter(_isDefaultSlotNode)) {
            label.appendChild(node);
        }
    }

    _syncIconState() {
        const host = this.shadowRoot && this.shadowRoot.querySelector('.uxp-icon-host');
        const icon = host ? host.firstElementChild : null;

        const iconOnly = !!icon && !this.slotHasContent;
        if (iconOnly) {
            this.setAttribute('icon-only', '');
        } else {
            this.removeAttribute('icon-only');
        }

        if (!icon) return;

        const badgeSize = this.getAttribute('size');
        if (badgeSize && icon.getAttribute('size') !== badgeSize) {
            icon.setAttribute('size', badgeSize);
        }
    }
}

export { UxpBadge as Badge };
