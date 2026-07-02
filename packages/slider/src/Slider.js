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

import { html, nothing } from '@spectrum-web-components/base';
import { styleMap } from '@spectrum-web-components/base/src/directives.js';
import { Slider as SliderUpstream } from '@swc-uxp-internal/slider/src/Slider.js';
import styles from './uxp-slider.css.js';

class UxpSlider extends SliderUpstream {
    static get styles() {
        return [...super.styles, styles];
    }

    // UXP: :focus-visible is not in uxp-css-data (not supported). element.matches(':focus-visible')
    // may throw SyntaxError or silently return false — either way keyboard focus highlighting
    // is broken without this override. Return false unconditionally to prevent both.
    // Also note: :focus-within is equally unsupported. The v1.12.0 multi-handle value tooltips
    // (shown via :focus-within when label-visibility is "none"/"text") will not appear on
    // keyboard focus in UXP; hover-triggered tooltips work normally (via :hover).
    hasVisibleFocusInTree() {
        return false;
    }

    // UXP: CSS dynamic class changes (classList.add) don't trigger style recalculation.
    // Override renderTrackSegment to inject 'uxp-fill' as a STATIC class at Lit
    // render time so UXP's CSS engine sees it from the start.
    // The fill segment is always segments[1] (between the two handles) in range mode.
    //
    // UXP: logical inset-inline-start/end not supported; left:X% inline style also
    // doesn't resolve against the containing block in shadow DOM. Embed pixel left
    // using controlsWidth = trackWidth - handleSize (mirrors #controls margin-inline).
    // Use -9999px before dimensions are known to prevent ghost at left:0.
    renderTrackSegment(start, end) {
        if (this.variant === 'ramp') return nothing;
        let isFill = false;
        if (this.variant === 'range') {
            const segs = this.handleController?.trackSegments?.();
            isFill = segs?.length >= 3 && segs[1][0] === start && segs[1][1] === end;
        }
        const baseStyles = this.trackSegmentStyles(start, end);
        // UXP: for non-tick variants (range), track segments and handles are DIRECT children
        // of #controls (position:relative). Both resolve left:X% and absolute left:Xpx against
        // #controls, so _uxpTrackWidth must equal #controls.getBoundingClientRect().width.
        // #track has margin-inline: -handleSize/2, making its BCR handleSize wider — using
        // #track.BCR.width shifts fills by up to handleSize * fraction and causes overlap.
        // (For tick variant, tracks are inside .trackContainer and use a different tw; see
        // renderTicks and _applyPixelPositions.)
        const tw = this._uxpTrackWidth;
        const hs = this._uxpHandleSize ?? 0;
        // handleOffset = handleSize/2 + handleGap — clears the circular handle on each adjoining edge.
        // _uxpHandleGap is read from --spectrum-slider-handle-gap in firstUpdated(); fallback to 4.
        const handleOffset = (tw > 0) ? Math.round(hs / 2) + (this._uxpHandleGap ?? 4) : 0;
        // uxp-track-first / uxp-track-last: UXP incorrectly applies the upstream
        // .track~.track::before fill-color rule to ALL .track::before elements (sibling
        // combinator ignored). Use explicit classes for first and last range tracks so
        // they can be reset to track-color without relying on structural pseudo-classes.
        const isFirstRangeTrack = !isFill && this.variant === 'range' && start === 0;
        // Use epsilon comparison to guard against float imprecision with non-integer steps
        // (e.g. step=0.3 can produce end=0.9000000000000001 instead of 1.0).
        const isLastRangeTrack = !isFill && this.variant === 'range' && start > 0 && end >= 1.0 - 1e-9;
        // UXP: variant="filled" without fill-start — upstream applies fill color via
        // :host([variant=filled]) .track:first-child::before, which UXP forces to
        // rgb(175,175,175). Re-use the uxp-fill class so ::before is hidden and the
        // correct fill background is applied directly to the div (same pattern as range fill).
        const isFilledFirstTrack = !isFill && this.variant === 'filled' && start === 0;
        // UXP: upstream creates visual clearance around handles via padding-inline +
        // background-clip:content-box on ::before — both broken in UXP shadow DOM.
        // Apply handleOffset to every track edge that adjoins a handle so all three
        // range tracks (first, fill, last) are symmetric and clear both handle circles.
        let styles = baseStyles;
        if (isFill && tw > 0) {
            const fillLeft = start * tw + handleOffset;
            const fillWidth = Math.max(0, (end - start) * tw - 2 * handleOffset);
            styles = { ...baseStyles, left: `${fillLeft}px`, width: `${fillWidth}px`, right: 'auto' };
        } else if (isFilledFirstTrack) {
            // Filled variant first track: left=0, width=end*tw. No handle-gap clearance needed
            // (the upstream CSS uses padding-inline + background-clip on ::before for the gap,
            // which doesn't work in UXP — the gap is simply absent, matching fill-to-handle).
            if (tw > 0) {
                styles = { ...baseStyles, left: '0px', width: `${Math.max(0, end * tw)}px`, right: 'auto' };
            } else {
                styles = { ...baseStyles, left: '-9999px' }; // sentinel until tw is known
            }
        } else if (isFirstRangeTrack && tw > 0) {
            // Right edge must clear the left handle: width shrinks by handleOffset.
            styles = { ...baseStyles, left: '0px', width: `${Math.max(0, end * tw - handleOffset)}px`, right: 'auto' };
        } else if (isLastRangeTrack) {
            // Left edge must clear the right handle: left shifts by handleOffset.
            if (tw > 0) {
                const trackLeft = start * tw + handleOffset;
                styles = { ...baseStyles, left: `${trackLeft}px`, width: `${Math.max(0, tw - trackLeft)}px`, right: 'auto' };
            } else {
                styles = { ...baseStyles, left: '-9999px' };
            }
        } else if (start > 0 && this.variant !== 'tick') {
            // Non-range, non-tick track starting after position 0: left edge must clear
            // the handle's right half so the track doesn't visually run through the handle.
            // (Tick variant tracks are NOT cleared — the handle sits on the continuous track.
            // Tick tracks are inside .trackContainer and positioned by upstream CSS using
            // left:V% against trackContainer.width = tw+hs, ending correctly at tick[last].)
            if (tw > 0) {
                const segLeft = start * tw + Math.round(hs / 2);
                styles = { ...baseStyles, left: `${segLeft}px`, width: `${Math.max(0, tw - segLeft)}px`, right: 'auto' };
            } else {
                styles = { ...baseStyles, left: '-9999px' };
            }
        }
        const trackClass = (isFill || isFilledFirstTrack) ? 'track uxp-fill'
            : isFirstRangeTrack ? 'track uxp-track-first'
            : isLastRangeTrack ? 'track uxp-track-last'
            : 'track';
        return html`
            <div
                class=${trackClass}
                style=${styleMap(styles)}
                role="presentation"
            ></div>
        `;
    }

    // UXP: logical % properties (inset-inline-start: X%, inline-size: X%) resolve
    // against physical containing-block width = 0.  Remove inline styles from ticks;
    // _applyPixelPositions() applies physical left:Xpx once dimensions are captured.
    renderTicks() {
        if (this.variant !== 'tick') return nothing;
        const tickStep = this.tickStep || this.step || 1;
        const tickCount = (this.max - this.min) / tickStep;
        const partialFit = tickCount % 1 !== 0;
        const ticks = new Array(Math.floor(tickCount + 1));
        ticks.fill(0);
        return html`
            <div class="${partialFit ? 'not-exact ' : ''}ticks">
                ${ticks.map((_tick, i) => {
                    const value = i * tickStep + this.min;
                    return html`
                        <div class="tick">
                            ${this.tickLabels
                                ? html`<div class="tickLabel">${value}</div>`
                                : nothing}
                        </div>
                    `;
                })}
            </div>
        `;
    }

    updated(changedProperties) {
        super.updated?.(changedProperties);
        // Only tick and range variants need JS pixel positioning; other variants
        // (regular, ramp, filled) are fully handled by Lit's styleMap in renderTrackSegment.
        if (this.variant === 'tick' || this.variant === 'range') {
            requestAnimationFrame(() => {
                this._applyPixelPositions();
            });
        }
    }

    _applyPixelPositions() {
        const trackWidth = this._uxpTrackWidth ?? 0;
        const handleSize = this._uxpHandleSize ?? 0;
        if (trackWidth <= 0) return;

        // --- Tick positioning ---
        // In the tick variant, DOM is: #controls > [.ticks, .trackContainer, .handleContainer]
        // .ticks is NOT positioned → .tick[position:absolute] resolve left:X against #controls.
        // .handleContainer IS positioned, at margin-left=-hs/2 from #controls, width=tw+hs.
        // Handle left:V% resolves against .handleContainer (width = tw + hs).
        //
        // Handle center from controls:
        //   = .handleContainer.left_from_controls + handle.CSS.left + handle.marginLeft + hs/2
        //   = (-hs/2) + V*(tw+hs) + (-hs/2) + hs/2
        //   = V*(tw+hs) - hs/2
        //
        // Tick position from controls = tick.style.left (resolves directly against #controls).
        // Setting tick.style.left = handle center from controls:
        //   tick.style.left = V*(tw+hs) - hs/2
        if (this.variant === 'tick') {
            const ticks = this.shadowRoot?.querySelectorAll('.tick');
            if (ticks?.length) {
                const tickStep = this.tickStep || this.step || 1;
                const range = this.max - this.min;
                ticks.forEach((tick, i) => {
                    const V = (i * tickStep) / range;
                    tick.style.setProperty('left', (V * (trackWidth + handleSize) - handleSize / 2) + 'px');
                });
            }
        }

        // --- Range fill ---
        // UXP: logical inset-inline-start/end not supported. renderTrackSegment now
        // embeds pixel left (start * _uxpTrackWidth) once trackWidth is known, so the
        // fill and last track are correctly positioned from the Lit render itself.
        // This fallback JS override handles the window between first render (trackWidth=0)
        // and ResizeObserver (trackWidth=1326px), where Lit set no left on the segments.
        if (this.variant === 'range') {
            const hc = this.handleController;
            const tracks = this.shadowRoot?.querySelectorAll('.track');
            if (tracks?.length >= 3) {
                const segs = hc?.trackSegments?.();
                if (segs?.length >= 3) {
                    // Scale by #controls.BCR.width — the actual coordinate space for both
                    // tracks and handles. (Stored in _uxpTrackWidth via ResizeObserver on #controls.)
                    const handleOffset = Math.round(handleSize / 2) + (this._uxpHandleGap ?? 4);
                    // First track: starts at 0, right edge clears the left handle.
                    tracks[0].style.setProperty('left', '0px');
                    tracks[0].style.setProperty('width', Math.max(0, segs[0][1] * trackWidth - handleOffset) + 'px');
                    tracks[0].style.setProperty('right', 'auto');
                    // Fill track: both edges clear their respective handles.
                    const fillLeft = segs[1][0] * trackWidth + handleOffset;
                    const fillWidth = Math.max(0, (segs[1][1] - segs[1][0]) * trackWidth - 2 * handleOffset);
                    tracks[1].style.setProperty('left', fillLeft + 'px');
                    tracks[1].style.setProperty('width', fillWidth + 'px');
                    tracks[1].style.setProperty('right', 'auto');
                    // Last track: left edge clears the right handle.
                    const lastLeft = segs[2][0] * trackWidth + handleOffset;
                    tracks[2].style.setProperty('left', lastLeft + 'px');
                    tracks[2].style.setProperty('width', Math.max(0, trackWidth - lastLeft) + 'px');
                    tracks[2].style.setProperty('right', 'auto');
                }
            }
        }
    }

    _captureUxpDimensions() {
        // Track segments are absolutely positioned relative to #controls (their nearest
        // positioned ancestor). #track has negative margin-inline (-handleSize/2) making
        // its BCR wider than #controls by handleSize — using #track BCR overshifts the
        // fill and causes overlap with handles. Use #controls width instead.
        const controlsEl = this.shadowRoot?.querySelector('#controls');
        const ctrlBcr = controlsEl?.getBoundingClientRect();
        if (ctrlBcr?.width > 0) {
            this._uxpTrackWidth = ctrlBcr.width;
        } else {
            const trackBcr = this.track?.getBoundingClientRect();
            if (trackBcr?.width > 0) {
                this._uxpTrackWidth = trackBcr.width;
            } else {
                const hostBcr = this.getBoundingClientRect();
                if (hostBcr.width > 0) this._uxpTrackWidth = hostBcr.width;
            }
        }

        const handleEl = this.shadowRoot?.querySelector('.handle');
        const hBcr = handleEl?.getBoundingClientRect();
        if (hBcr?.width > 0) this._uxpHandleSize = hBcr.width;
        if (this._uxpTrackWidth > 0) this._applyPixelPositions();
    }

    firstUpdated(...args) {
        super.firstUpdated?.(...args);

        const hc = this.handleController;

        // UXP: get handle size from CSS computed style now, before ResizeObserver fires.
        // BCR returns 0 outside pointer events, but getComputedStyle().width should
        // resolve the CSS token value correctly for handles with explicit inline-size.
        const handleElForSize = this.shadowRoot?.querySelector('.handle');
        if (handleElForSize && !this._uxpHandleSize) {
            const cs = getComputedStyle(handleElForSize);
            // Try physical width first, then logical inlineSize.
            const w = parseFloat(cs.width) || parseFloat(cs.inlineSize) || 0;
            if (w > 0) this._uxpHandleSize = w;
        }
        // UXP: getComputedStyle().width/inlineSize returns 0 for elements whose size
        // is defined by the CSS logical property inline-size. Fall back to a lookup
        // keyed on the size attribute, using Spectrum 2 medium-platform token values:
        //   s=14  → --spectrum-slider-handle-size-small
        //   m=16  → --spectrum-slider-handle-size-medium
        //   l=18  → --spectrum-slider-handle-size-large
        //   xl=20 → --spectrum-slider-handle-size-extra-large
        // Values are SWC v1.12.0 / Spectrum 2 medium scale. Update if tokens change.
        if (!this._uxpHandleSize) {
            const sizeMap = { s: 14, m: 16, l: 18, xl: 20 };
            this._uxpHandleSize = sizeMap[this.getAttribute('size') ?? 'm'] ?? 16;
        }

        // Read --spectrum-slider-handle-gap token for use in renderTrackSegment /
        // _applyPixelPositions. The token controls the visual clearance between the handle
        // edge and the visible fill bar (4px in Spectrum 2 for all sizes).
        // Fallback to 4 if the token is unavailable (no sp-theme ancestor).
        const hostCs = getComputedStyle(this);
        const gap = parseFloat(hostCs.getPropertyValue('--spectrum-slider-handle-gap'));
        this._uxpHandleGap = gap > 0 ? gap : 4;

        // UXP: handle background fix (all variants).
        // The handle controller renders an inline style:
        //   background-color: var(--spectrum-slider-handle-background-color-{N},
        //                        var(--spectrum-slider-handle-background-color))
        // In UXP, inline styles win over shadow DOM CSS even with !important.
        // Both tokens resolve to transparent because the Spectrum 2 theme bridge does not
        // define --system-slider-handle-background-color.
        //
        // Fix A: set --spectrum-slider-handle-background-color (the common fallback for ALL
        // handle indices) on the host so every handle picks it up via CSS inheritance.
        // Fix B: for ramp, also set the indexed property with the ramp-specific token chain.
        // Chrome: the CSS rule in uxp-slider.css handles ramp via !important (which wins in Chrome).
        // UXP dark/light: --spectrum-gray-75 is a Spectrum 2 token absent in UXP's S1 theme bridge.
        // --spectrum-global-color-gray-75 IS provided by UXP's S1 theme (dark=rgb(38,38,38),
        // light=rgb(253,253,253)) and gives the correct surface color in both modes.
        // #fafafa is kept as a last resort for environments with no sp-theme ancestor at all.
        this.style.setProperty(
            '--spectrum-slider-handle-background-color',
            'var(--mod-slider-handle-background-color, var(--highcontrast-slider-handle-background-color, var(--spectrum-gray-75, var(--spectrum-global-color-gray-75, #fafafa))))'
        );
        if (this.variant === 'ramp') {
            // Ramp handle: use surface color (matching official SWC).
            // box-shadow: none is set in uxp-slider.css to suppress the upstream 4px shadow
            // ring that creates a "double ring" appearance on the dark ramp gradient.
            this.style.setProperty(
                '--spectrum-slider-handle-background-color-0',
                'var(--mod-slider-ramp-handle-background-color, var(--highcontrast-slider-ramp-handle-background-color, var(--spectrum-slider-ramp-handle-background-color, var(--spectrum-gray-75, var(--spectrum-global-color-gray-75, #fafafa)))))'
            );
        }

        // UXP: :focus-visible throws in onInputFocus; suppress highlight safely.
        if (hc && typeof hc.onInputFocus === 'function') {
            hc.onInputFocus = (e) => {
                if (e.target.model) e.target.model.handle.highlight = false;
                hc.requestUpdate();
            };
        }

        // UXP: querySelector(':scope > .input') always returns null.
        if (hc && typeof hc.extractDataFromEvent === 'function') {
            hc.extractDataFromEvent = (e) => {
                if (!hc._activePointerEventData) {
                    let input = null;
                    if (e.target?.classList?.contains('handle')) {
                        input = e.target.querySelector('.input') ?? null;
                    }
                    const resolvedInput = !input;
                    const model = input
                        ? input.model
                        : hc.model?.find((m) => m.name === hc.activeHandle);
                    if (!input && model) input = model.handle?.focusElement ?? null;
                    hc._activePointerEventData = { input, model, resolvedInput };
                }
                return hc._activePointerEventData;
            };
        }

        // UXP: labelEl.click() causes native focus ring on hidden input.
        if (hc && typeof hc.handlePointerdown === 'function') {
            hc.handlePointerdown = (e) => {
                this._captureUxpDimensions();
                const { resolvedInput, model } = hc.extractDataFromEvent(e);
                // `!model` is a safety guard — for a properly initialized slider, extractDataFromEvent
                // always resolves a model via hc.activeHandle. disabled and button !== 0 are the
                // common active paths.
                if (!model || this.disabled || e.button !== 0) {
                    e.preventDefault();
                    return;
                }
                this.track.setPointerCapture(e.pointerId);
                hc.updateBoundingRect();
                hc.draggingHandle = model.handle;
                model.handle.dragging = true;
                hc.activateHandle(model.name);
                if (resolvedInput) hc.handlePointermove(e);
                hc.requestUpdate();
            };
        }

        if (hc && typeof hc.handlePointerup === 'function') {
            hc.handlePointerup = (e) => {
                const { input, model } = hc.extractDataFromEvent(e);
                delete hc._activePointerEventData;
                if (!model) return;
                const isDragging = !!hc.draggingHandle;
                hc.cancelDrag(model);
                hc.requestUpdate();
                this.track.releasePointerCapture(e.pointerId);
                if (isDragging) hc.dispatchChangeEvent(input, model.handle);
            };
        }

        // UXP: the upstream HandleController registers pointermove via streamingListener, which
        // throttles delivery through requestAnimationFrame (see streaming-listener.js handleStream).
        // Since UXP does not fire rAF during drag event delivery, streamingListener's pointermove
        // effectively never fires while dragging. Add a direct unthrottled listener on #track
        // (which holds pointer capture during drag) to bypass the rAF throttle.
        // Store references so disconnectedCallback() can remove them.
        const trackEl = this.shadowRoot?.querySelector('#track');
        if (trackEl) {
            this._uxpPointermoveHandler = (e) => {
                if (!hc.draggingHandle) return;
                hc.handlePointermove(e);
            };
            trackEl.addEventListener('pointermove', this._uxpPointermoveHandler);
        }

        // UXP: <input type="range">.value assignment does not snap to step.
        if (hc && typeof hc.handlePointermove === 'function') {
            hc.handlePointermove = function (e) {
                const { input, model } = this.extractDataFromEvent(e);
                if (!model || !this.draggingHandle) return;
                const raw = this.calculateHandlePosition(e, model);
                // UXP: boundingRect.width=0 at startup produces NaN raw — guard before writing to model.
                if (!isFinite(raw)) return;
                const step = model.step || 1;
                const snapped =
                    Math.round((raw - model.range.min) / step) * step +
                    model.range.min;
                const decimals = (step.toString().split('.')[1] || '').length;
                const rounded = parseFloat(snapped.toFixed(decimals));
                const clamped = Math.min(
                    model.clamp.max,
                    Math.max(model.clamp.min, rounded)
                );
                input.value = clamped.toString();
                model.handle.value = clamped;
                this.host.indeterminate = false;
                this.requestUpdate();
            };
        }

        // UXP: NumberFormatter without formatOptions defaults to 2 decimal places.
        if (hc && typeof hc.formattedValueForHandle === 'function') {
            hc.formattedValueForHandle = function (model) {
                const { handle } = model;
                const _forcedUnit =
                    (handle._forcedUnit === ''
                        ? this.host._forcedUnit
                        : handle._forcedUnit) || '';
                if (!handle.formatOptions && !this.host.formatOptions) {
                    const step = model.step ?? this.host.step ?? 1;
                    const decimals = (step.toString().split('.')[1] || '').length;
                    return model.value.toFixed(decimals) + _forcedUnit;
                }
                const numberFormat =
                    handle.numberFormat ?? this.host.numberFormat;
                return (
                    handle.getAriaHandleText(model.value, numberFormat) +
                    _forcedUnit
                );
            };
        }

        // UXP: try ResizeObserver on #controls for initial dimension capture.
        // #controls is the positioned ancestor for both track segments and handles, so its
        // BCR width is the correct coordinate space. (#track has negative margin-inline
        // making its BCR/contentRect wider by handleSize — wrong to use as tw.)
        // Store as instance property so disconnectedCallback() can disconnect early if needed.
        if (typeof ResizeObserver !== 'undefined') {
            this._uxpRO = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const w = entry.contentRect?.width
                        || entry.borderBoxSize?.[0]?.inlineSize
                        || 0;
                    if (w > 0) {
                        // Re-read BCR of #controls at fire time — this is the actual containing
                        // block for handle left:X% and for absolute-positioned track segments.
                        // entry.contentRect.width is the content box of the OBSERVED element
                        // (#controls itself when we observe it, so they agree here).
                        this._uxpTrackWidth = w;
                        // If handle size not yet known, try computed style now.
                        if (!this._uxpHandleSize) {
                            const hEl = this.shadowRoot?.querySelector('.handle');
                            if (hEl) {
                                const cs = getComputedStyle(hEl);
                                const hw = parseFloat(cs.width) || parseFloat(cs.inlineSize) || 0;
                                if (hw > 0) this._uxpHandleSize = hw;
                            }
                        }
                        this._applyPixelPositions();
                        // Re-render so renderTrackSegment uses the now-known trackWidth
                        // to embed pixel left in the Lit template (prevents left:0 flash).
                        this.requestUpdate();
                        // Keep the ResizeObserver alive — layout changes after the initial
                        // render (e.g. scrollbar appearing/disappearing, panel resize) shrink
                        // #controls and must update tw so track positions stay in sync.
                        // Track segments are position:absolute, so changing their style does
                        // NOT resize #controls, so there is no feedback loop.
                        return;
                    }
                }
            });
            // Observe #controls (not #track) — both handles and track segments are
            // positioned children of #controls, so its resize events give the correct tw.
            const controlsElForRO = this.shadowRoot?.querySelector('#controls') ?? this.track ?? this;
            this._uxpRO.observe(controlsElForRO);
        }

        // Fallback: capture on first hover — pointer event context gives correct BCR.
        this.addEventListener('pointerover', () => this._captureUxpDimensions(), { once: true });

        // Force a re-render so renderTrackSegment picks up _uxpHandleGap / _uxpHandleSize
        // values set above. ResizeObserver also calls requestUpdate() when it fires, but it
        // may fire after the initial paint, leaving a brief window where track offsets use
        // the defaults (handleOffset = 0). This re-render closes that window.
        this.requestUpdate();
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        // Clean up the UXP-specific pointermove listener added in firstUpdated().
        const trackEl = this.shadowRoot?.querySelector('#track');
        if (trackEl && this._uxpPointermoveHandler) {
            trackEl.removeEventListener('pointermove', this._uxpPointermoveHandler);
            this._uxpPointermoveHandler = null;
        }
        // Disconnect ResizeObserver if it hasn't fired yet.
        this._uxpRO?.disconnect();
        this._uxpRO = null;
    }
}

export { UxpSlider as Slider };
