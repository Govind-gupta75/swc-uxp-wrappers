/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { Asset } from '@swc-uxp-internal/asset/src/Asset.js';

import styles from './uxp-asset.css.js';

class UxpAsset extends Asset {
    static get styles() {
        // We are combining our styles to make all super class styles available along with the transitive dependent classes styles.
        return [...super.styles, styles];
    }

    // UXP-24439: sp-asset/sp-dropzone icons rendered visibly smaller in UXP than in SWC
    // Web. See uxp-asset.css for the full root-cause writeup — in short, the icon's width
    // and height resolve against two different reference boxes in UXP (width against its
    // own available inline space via a physical min/max clamp, height as a percentage of
    // the host's block size), so no combination of CSS alone can guarantee they land on
    // the same pixel value. _syncAssetHeight() closes that gap by reading the real
    // rendered width and forcing height to match it directly. Re-run it on every update
    // (covers Lit-driven re-renders) AND re-arm _observeAssetSize() each time too, since a
    // re-render can swap in a different .file/.folder element (e.g. switching between the
    // file and folder icon) that isn't being watched yet.
    updated(changes) {
        super.updated(changes);
        this._syncAssetHeight();
        this._observeAssetSize();
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        this._uxpAssetResizeObserver?.disconnect();
        this._uxpAssetResizeObserver = null;
        this._uxpObservedAsset = null;
    }

    // Force the icon's height, in pixels, to match its own actual rendered width. This is
    // the actual fix for UXP-24439 (see uxp-asset.css for why CSS alone can't do this in
    // UXP): width is clamped via a physical min/max rule against the icon's own available
    // inline space, while height is only floored (via :host min-height) against the host's
    // block size — two different boxes, no guaranteed relationship between the two
    // resolved values. Reading the real width post-layout and setting height to match it
    // directly guarantees a square icon regardless of what the width clamp actually
    // produces in a given container, instead of hoping two independent CSS clamps agree.
    _syncAssetHeight() {
        const asset = this.shadowRoot?.querySelector('.file, .folder');
        if (!asset) return;

        const width = asset.getBoundingClientRect().width;
        if (width > 0) {
            asset.style.height = `${width}px`;
        }
    }

    // updated() alone only catches size changes caused by a Lit-reactive property
    // changing (i.e. this component re-rendering). It misses size changes with no such
    // trigger — a resized container, an ancestor changing a --mod-asset-icon-*-width
    // custom property, a --mod-asset-icon-margin change, etc. A ResizeObserver on the
    // actual .file/.folder element catches those too, so the icon stays square whenever
    // its width changes, not only when this component itself happens to re-render.
    _observeAssetSize() {
        const asset = this.shadowRoot?.querySelector('.file, .folder');
        if (
            asset === this._uxpObservedAsset ||
            typeof ResizeObserver === 'undefined'
        ) {
            return;
        }

        this._uxpAssetResizeObserver?.disconnect();
        this._uxpObservedAsset = asset;
        this._uxpAssetResizeObserver = new ResizeObserver(() =>
            this._syncAssetHeight()
        );
        this._uxpAssetResizeObserver.observe(asset);
    }
}

export { UxpAsset as Asset };
