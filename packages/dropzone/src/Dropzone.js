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

import { Dropzone } from '@swc-uxp-internal/dropzone/src/Dropzone.js';

import styles from './uxp-dropzone.css.js';

// ── UXP detection ─────────────────────────────────────────────────────────
// eval('require') bypasses webpack's static module analysis.
// In UXP:             eval('require')('uxp') succeeds  → _nativeRequire is set.
// In webpack/browser: require('uxp') throws "Cannot find module" → stays null.
let _nativeRequire = null;
(function () {
    try {
        const r = eval('require'); // eslint-disable-line no-eval
        r('uxp');                  // throws in webpack, succeeds in UXP
        _nativeRequire = r;
    } catch (_) {}
}());

// ── Accept-filter helpers ─────────────────────────────────────────────────
// Extension lists for MIME wildcard fallback when MIME type is unavailable (UXP).
const CATEGORY_EXTS = {
    image: [
        // Standard web formats
        'jpg','jpeg','jfif','pjpeg','pjp','jpe',
        'png','gif','webp','bmp','svg','svgz',
        'tiff','tif','ico','cur','avif','heic','heif','apng',
        // Adobe native formats
        'psd','psb',   // Photoshop
        'ai',          // Illustrator
        'eps',         // Encapsulated PostScript
        'pdf',         // PDF (opened as image in Photoshop)
        'dng',         // Adobe Digital Negative
        // Camera RAW formats (opened via Camera Raw / Lightroom)
        'cr2','cr3',   // Canon
        'nef','nrw',   // Nikon
        'arw','srf',   // Sony
        'raf',         // Fujifilm
        'rw2',         // Panasonic
        'orf',         // Olympus
        'raw','rwl',   // Leica
        'pef',         // Pentax
        '3fr',         // Hasselblad
    ],
    video: [
        // Standard web/container formats
        'mp4','m4v','mov','avi','mkv','webm','wmv',
        'flv','mpeg','mpg','ogv','3gp','3g2',
        // Professional / broadcast formats
        'mxf',         // Material Exchange Format (Premiere Pro, broadcast)
        'r3d',         // RED camera
        'braw',        // Blackmagic RAW
        'mts','m2ts',  // AVCHD (cameras)
        'ts','vob',    // Transport Stream, DVD VOB
        'f4v',         // Flash video
        'divx','xvid', // DivX/Xvid encoded
    ],
    audio: [
        'mp3','wav','ogg','oga','m4a','aac','flac',
        'wma','opus','aiff','aif',
        'amr',         // Adaptive Multi-Rate (mobile)
        'caf',         // Core Audio Format (Apple/Logic)
        'mxf',         // MXF audio-only
    ],
    text: [
        'txt','csv','log','md','markdown','rst',
        'json','xml','yaml','yml','toml','ini','env',
        'html','htm','css','js','mjs','cjs','ts','tsx','jsx',
        'py','rb','php','java','c','cpp','cc','cxx','h','hpp',
        'sh','bash','zsh','bat','cmd','ps1',
        'sql','diff','patch','gitignore',
    ],
};

function extOf(name) {
    const dot = name.lastIndexOf('.');
    return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
}

/**
 * Returns true if the file matches the accept string (same syntax as <input accept>).
 * Falls back to extension matching when mimeType is unavailable (UXP drag & drop).
 *
 * @param {string} name     - File name (used for extension matching)
 * @param {string} mimeType - MIME type if known, empty string otherwise
 * @param {string} accept   - Comma-separated accept tokens: MIME types, wildcards, extensions
 */
function isAccepted(name, mimeType, accept) {
    if (!accept || accept === '*') return true;
    const ext = extOf(name);
    const mime = (mimeType || '').toLowerCase();
    return accept.split(',').map(s => s.trim().toLowerCase()).some(token => {
        if (!token) return false; // skip empty tokens (e.g. trailing comma in accept string)
        // Extension token: ".jpg"
        if (token.startsWith('.')) return ext === token.slice(1);
        // Wildcard MIME: "image/*"
        if (token.endsWith('/*')) {
            const cat = token.slice(0, -2);
            if (mime) return mime.startsWith(cat + '/');
            return (CATEGORY_EXTS[cat] || []).includes(ext);
        }
        // Exact MIME: "image/jpeg"
        if (mime) return mime === token;
        // Exact MIME requested but no MIME available — match by extension for known categories.
        for (const [cat, exts] of Object.entries(CATEGORY_EXTS)) {
            if (token.startsWith(cat + '/')) return exts.includes(ext);
        }
        // Unknown MIME-shaped token with no MIME info available — cannot verify, reject.
        // Non-MIME tokens (no '/') fall through as allowed.
        return !token.includes('/');
    });
}

/**
 * Converts an <input accept>-style string to a UXP getFileForOpening `types` array
 * (file extensions without the leading dot).
 *
 * Returns undefined when accept is empty/wildcard so callers can omit the option
 * entirely and let UXP default to showing all files.
 *
 * The mapping covers web-standard formats (image, video, audio, text) as well as
 * common Adobe and professional formats (PSD, PSB, AI, camera RAW, MXF, etc.)
 * that are relevant in UXP host applications such as Photoshop and Premiere Pro.
 * Project-file formats with no MIME wildcard equivalent (e.g. PRPROJ, AEP) are
 * not included; use explicit extension tokens for those: accept='.prproj,.mp4'.
 *
 * Note: this list is also used for UXP drag-and-drop filtering, where no MIME
 * type is available and extension matching is the only option.
 *
 * Exact MIME tokens (e.g. 'image/jpeg') expand to the whole category from
 * CATEGORY_EXTS — slightly over-permissive in the picker, but the drop-time
 * filter in _fireDropEvent provides the authoritative check.
 *
 * @param {string} accept
 * @returns {string[] | undefined}
 */
function acceptToUxpTypes(accept) {
    if (!accept || accept === '*') return undefined;
    const types = new Set();
    accept.split(',').map(s => s.trim().toLowerCase()).forEach(token => {
        if (!token) return;
        if (token.startsWith('.')) {
            types.add(token.slice(1));
        } else if (token.endsWith('/*')) {
            (CATEGORY_EXTS[token.slice(0, -2)] || []).forEach(ext => types.add(ext));
        } else if (token.includes('/')) {
            // Exact MIME: expand to the whole MIME category as an approximation.
            (CATEGORY_EXTS[token.split('/')[0]] || []).forEach(ext => types.add(ext));
        }
    });
    return types.size > 0 ? [...types] : undefined;
}

// ── UxpDropzone ───────────────────────────────────────────────────────────

class UxpDropzone extends Dropzone {
    static get styles() {
        return [...super.styles, styles];
    }

    constructor() {
        super();
        this._accept = '';
    }

    /**
     * Accepted file types — same syntax as the HTML <input accept> attribute.
     * Examples: 'image/*', 'text/*', '.jpg,.png', '' (all files, default).
     */
    get accept() {
        return this._accept;
    }

    set accept(value) {
        this._accept = (value || '').trim();
    }

    // ── Override onDrop: resolve files then fire the drop event ─────────────

    onDrop(event) {
        event.preventDefault();
        this.clearDebouncedDragLeave();
        this.isDragged = false;

        if (_nativeRequire) {
            this._resolveAndFireUXP(event);
        } else {
            const files = Array.from(event.dataTransfer?.files || []).map(f => ({
                name: f.name,
                nativePath: '',
                type: f.type,
                size: f.size,
            }));
            this._fireDropEvent(event, files, 'drop');
        }
    }

    // ── UXP: async file entry resolution ────────────────────────────────────

    _resolveAndFireUXP(event) {
        const lfs = _nativeRequire('uxp').storage.localFileSystem;
        const dt = event.dataTransfer;
        const allItems = dt && dt.items ? Array.from(dt.items) : [];

        // UXP exposes two item kinds for Finder drags:
        //   kind='entry' (type='application/uxp-entry-type') — UXP-native entry
        //   kind='string' (type='com.apple.finder.node')     — macOS file-ref URL
        const uxpEntryItems = allItems.filter(item => item.kind === 'entry');
        const stringItems = allItems.filter(
            item => item.kind === 'string' && typeof item.getAsString === 'function'
        );

        const count = uxpEntryItems.length || stringItems.length;
        if (count === 0) {
            this._fireDropEvent(event, [], 'drop');
            return;
        }

        const resolved = [];
        let pending = count;
        const finish = () => {
            if (--pending === 0) this._fireDropEvent(event, resolved, 'drop');
        };

        const pushFromEntry = entry => {
            const nativePath = entry.nativePath || '';
            const name = nativePath
                ? nativePath.split('/').filter(Boolean).pop()
                : (entry.name || '');
            resolved.push({ name, nativePath, type: '', size: 0 });
        };

        const resolveViaString = (item, done) => {
            item.getAsString(url => {
                lfs.getEntryWithUrl(url)
                    .then(entry => {
                        pushFromEntry(entry);
                        done();
                    })
                    .catch(() => {
                        // getEntryWithUrl failed (e.g. macOS file-ref URL unsupported).
                        // Store the raw URL as nativePath so the caller still gets something.
                        resolved.push({ name: '', nativePath: url, type: '', size: 0 });
                        done();
                    });
            });
        };

        if (uxpEntryItems.length > 0) {
            uxpEntryItems.forEach((item, i) => {
                // UXP-specific API: item.uxpGetAsEntry() (not the web-standard getAsEntry).
                // Returns an Entry with nativePath from the drag provider's fileItem,
                // which already holds the actual OS path — no URL resolution needed.
                // May return synchronously or as a Promise depending on internal mode.
                let entryResult = null;
                try {
                    if (typeof item.uxpGetAsEntry === 'function') {
                        entryResult = item.uxpGetAsEntry();
                    }
                } catch (_) { /* uxpGetAsEntry not available — fall through to string fallback */ }

                const paired = stringItems[i];
                Promise.resolve(entryResult)
                    .then(entry => {
                        if (entry && (entry.nativePath || entry.name)) {
                            pushFromEntry(entry);
                            finish();
                        } else if (paired) {
                            // uxpGetAsEntry returned null — fall back to string item
                            resolveViaString(paired, finish);
                        } else {
                            resolved.push({ name: '', nativePath: '', type: '', size: 0 });
                            finish();
                        }
                    })
                    .catch(() => {
                        if (paired) {
                            resolveViaString(paired, finish);
                        } else {
                            resolved.push({ name: '', nativePath: '', type: '', size: 0 });
                            finish();
                        }
                    });
            });
        } else {
            stringItems.forEach(item => resolveViaString(item, finish));
        }
    }

    // ── Fire sp-dropzone-drop with resolved + filtered file list ────────────

    /**
     * Dispatches sp-dropzone-drop.
     *
     * detail shape:
     *   {
     *     dataTransfer : DataTransfer | null,   // native dataTransfer (null for picker)
     *     nativeEvent  : DragEvent   | null,
     *     files        : Array<{ name, nativePath, type, size }>,
     *     source       : 'drop' | 'picker',
     *     rejected     : boolean,               // true if accept filter blocked all files
     *   }
     */
    _fireDropEvent(nativeEvent, files, source) {
        let rejected = false;
        let filteredFiles = files;

        if (this._accept && files.length > 0) {
            const accepted = files.filter(f => isAccepted(f.name, f.type, this._accept));
            if (accepted.length === 0) {
                rejected = true;
                filteredFiles = [];
            } else {
                filteredFiles = accepted;
            }
        }

        this.dispatchEvent(new CustomEvent('sp-dropzone-drop', {
            bubbles: true,
            composed: true,
            detail: {
                dataTransfer: nativeEvent ? nativeEvent.dataTransfer : null,
                nativeEvent,
                files: filteredFiles,
                source,
                rejected,
            },
        }));
    }

    // ── File picker ──────────────────────────────────────────────────────────

    /**
     * Opens the platform-native file picker.
     * On completion fires sp-dropzone-drop with the same detail shape as a drag drop.
     *
     * @param {object} options
     * @param {boolean} [options.multiple=false] - Allow selecting multiple files
     */
    openFilePicker({ multiple = false } = {}) {
        if (_nativeRequire) {
            // UXP: use localFileSystem.getFileForOpening()
            const lfs = _nativeRequire('uxp').storage.localFileSystem;
            const uxpTypes = acceptToUxpTypes(this._accept);
            const opts = { allowMultiple: multiple };
            if (uxpTypes) opts.types = uxpTypes;
            lfs.getFileForOpening(opts)
                .then(result => {
                    const arr = Array.isArray(result) ? result : (result ? [result] : []);
                    if (arr.length === 0) return; // user cancelled
                    const files = arr.map(f => {
                        const nativePath = f.nativePath || '';
                        const name = nativePath
                            ? nativePath.split('/').filter(Boolean).pop()
                            : (f.name || '');
                        return { name, nativePath, type: '', size: 0 };
                    });
                    this._fireDropEvent(null, files, 'picker');
                })
                .catch(() => { /* user cancelled or picker unavailable */ });
        } else {
            // Chrome: programmatically open a hidden <input type="file">
            const input = document.createElement('input');
            input.type = 'file';
            if (multiple) input.multiple = true;
            if (this._accept) input.accept = this._accept;
            input.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
            document.body.appendChild(input);
            const cleanup = () => { try { document.body.removeChild(input); } catch (_) {} };
            input.addEventListener('change', () => {
                const files = Array.from(input.files || []).map(f => ({
                    name: f.name,
                    nativePath: '',
                    type: f.type,
                    size: f.size,
                }));
                cleanup();
                this._fireDropEvent(null, files, 'picker');
            });
            input.addEventListener('cancel', cleanup);
            input.click();
        }
    }
}

export { UxpDropzone as Dropzone };
