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

    _syncAssetHeight() {
        const asset = this.shadowRoot?.querySelector('.file, .folder');
        if (!asset) return;

        const width = asset.getBoundingClientRect().width;
        if (width > 0) {
            asset.style.height = `${width}px`;
        }
    }

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
