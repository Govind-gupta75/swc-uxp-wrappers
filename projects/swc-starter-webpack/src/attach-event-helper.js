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

function attachEvents(tabName) {
    if (tabName === 'sp-radio-group') {
        const eventListener1 = `
            const radiogroup1 = document.getElementById("radiogroup1");
            radiogroup1.addEventListener("change", function() {
                radiogroup1.invalid = radiogroup1.selected === 'fourth';
            });
        `;
        eval(eventListener1);

        const eventListener2 = `
        const radiogroup2 = document.getElementById("radiogroup2");
            radiogroup2.addEventListener("change", function() {
                const helpText = radiogroup2.querySelector("[slot='help-text']");
                const isInvalid = this.selected === 'fourth';
                helpText.icon = isInvalid;
                helpText.textContent = isInvalid ? 'You can not like ice cream.' : 'Everyone likes ice cream.';
                helpText.variant = isInvalid ? 'negative' : 'neutral';
            });
        `;

        eval(eventListener2);

        const eventListener3 = `
            const radiogroup3 = document.getElementById("radiogroup3");
            radiogroup3.addEventListener("change", function() {
                radiogroup3.invalid = radiogroup3.selected === 'fourth';
            });
        `;
        eval(eventListener3);
    }

    if (tabName === 'sp-swatch') {
        const eventListener1 = `
            const swatch = document.getElementById("swatch-group-single-select");
            swatch.addEventListener("change", () => {
                swatch.nextElementSibling.textContent = 'Selected: ' + JSON.stringify(swatch.selected);
            });
        `;
        eval(eventListener1);

        const eventListener2 = `
            const swatch = document.getElementById("swatch-group-gradient-select");
            swatch.addEventListener("change", () => {
                swatch.nextElementSibling.textContent = 'Selected: ' + JSON.stringify(swatch.selected);
            });
        `;
        eval(eventListener2);
    }

    if (tabName === 'sp-menu') {
        const eventListener1 = `
            const menu = document.getElementById('inherit-menu');
            menu.addEventListener("change", () => {
                menu.previousElementSibling.textContent = menu.value;
            });
        `;
        eval(eventListener1);
    }

    if (tabName === 'sp-checkbox') {
        const spCheckboxSizes = `
            const sizes = document.getElementById('checkbox-sizes');
            sizes.addEventListener("change", () => {
                document.querySelector('#dynamic-api-test').setAttribute('size', sizes.value); 
            });
        `;
        eval(spCheckboxSizes);

        const spCheckboxDisabled = `
            document.querySelector('#disabled').addEventListener('change', (evt) => {
                    const checked = evt.target.checked;
                    const checkbox = document.querySelector('#dynamic-api-test');
                    if (checked) {
                        checkbox.setAttribute("disabled", "disabled");
                    } else {
                        checkbox.removeAttribute("disabled");
                    }
                });
        `;
        eval(spCheckboxDisabled);

        const spCheckboxEmphasized = `
            document.querySelector('#emphasized').addEventListener('change', (evt) => {
                    const checked = evt.target.checked;
                    const checkbox = document.querySelector('#dynamic-api-test');
                    if (checked) {
                        checkbox.setAttribute("emphasized", "emphasized");
                    } else {
                        checkbox.removeAttribute("emphasized");
                    }
                });
        `;
        eval(spCheckboxEmphasized);

        const spCheckboxInvalid = `
            document.querySelector('#invalid').addEventListener('change', (evt) => {
                    const checked = evt.target.checked;
                    const checkbox = document.querySelector('#dynamic-api-test');
                    if (checked) {
                        checkbox.setAttribute("invalid", "invalid");
                    } else {
                        checkbox.removeAttribute("invalid");
                    }
                });
        `;
        eval(spCheckboxInvalid);

        const spCheckboxIntermediate = `
            document.querySelector('#indeterminate').addEventListener('change', (evt) => {
                    const checked = evt.target.checked;
                    const checkbox = document.querySelector('#dynamic-api-test');
                    if (checked) {
                        checkbox.setAttribute("indeterminate", "indeterminate");
                    } else {
                        checkbox.removeAttribute("indeterminate");
                    }
                });
        `;
        eval(spCheckboxIntermediate);

        const spCheckboxReadonly = `
            document.querySelector('#readonly').addEventListener('change', (evt) => {
                    const checked = evt.target.checked;
                    const checkbox = document.querySelector('#dynamic-api-test');
                    if (checked) {
                        checkbox.setAttribute("readonly", "readonly");
                    } else {
                        checkbox.removeAttribute("readonly");
                    }
                });
        `;
        eval(spCheckboxReadonly);
    }

    if (tabName === 'sp-dropzone') {
        var dz = document.getElementById('dropzone-interactive');
        var fileLabel = document.getElementById('file-select-label');
        var statusSuffix = document.getElementById('status-suffix');
        var draggedState = document.getElementById('dragged-state');
        var lastEvent = document.getElementById('last-event');
        var droppedFilename = document.getElementById('dropped-filename');
        var dropEffectGroup = document.getElementById('drop-effect-group');
        var acceptFilterGroup = document.getElementById('accept-filter-group');
        var currentDropEffect = document.getElementById('current-drop-effect');
        var currentAcceptFilter = document.getElementById('current-accept-filter');

        // ── Static demo zones: lock visual state ──────────────────────────────
        // Reject all drags so neither static zone ever changes its appearance.
        var dzDefault = document.getElementById('dropzone-default');
        var dzDragged = document.getElementById('dropzone-dragged');
        [dzDefault, dzDragged].forEach(function (zone) {
            // Cancel sp-dropzone-should-accept → base class skips isDragged=true.
            zone.addEventListener('sp-dropzone-should-accept', function (e) {
                e.preventDefault();
            });
            // Prevent sp-dropzone-drop from bubbling out of static display zones.
            zone.addEventListener('sp-dropzone-drop', function (e) {
                e.stopPropagation();
            });
        });
        // Restore isDragged=true on dzDragged after the debounced dragleave —
        // but NOT when a drop occurred (the browser re-fires dragleave after drop).
        var dzDraggedDropped = false;
        dzDragged.addEventListener('sp-dropzone-drop', function () {
            dzDraggedDropped = true;
        });
        dzDragged.addEventListener('sp-dropzone-dragleave', function () {
            if (dzDraggedDropped) { dzDraggedDropped = false; return; }
            dzDragged.isDragged = true;
        });

        // ── dropEffect ─────────────────────────────────────────────────────────
        dropEffectGroup.addEventListener('change', function () {
            var val = dropEffectGroup.selected;
            dz.dropEffect = val;
            currentDropEffect.textContent = val;
        });

        // ── Accept filter — maps radio value to component accept property ───────
        var ACCEPT_MAP = { all: '', image: 'image/*', text: 'text/*' };
        acceptFilterGroup.addEventListener('change', function () {
            var key = acceptFilterGroup.selected;
            dz.accept = ACCEPT_MAP[key] !== undefined ? ACCEPT_MAP[key] : '';
            currentAcceptFilter.textContent = key;
        });

        // ── File picker — delegate entirely to the component ───────────────────
        fileLabel.addEventListener('click', function () {
            dz.openFilePicker({ multiple: true });
        });

        // ── sp-dropzone-dragover ───────────────────────────────────────────────
        dz.addEventListener('sp-dropzone-dragover', function () {
            draggedState.textContent = 'true';
            statusSuffix.textContent = ' — drop to upload';
            lastEvent.textContent = 'sp-dropzone-dragover';
        });

        // ── sp-dropzone-dragleave ──────────────────────────────────────────────
        dz.addEventListener('sp-dropzone-dragleave', function () {
            draggedState.textContent = 'false';
            statusSuffix.textContent = ' from your computer';
            lastEvent.textContent = 'sp-dropzone-dragleave';
        });

        // ── sp-dropzone-drop ───────────────────────────────────────────────────
        // detail: { files, source ('drop'|'picker'), rejected, dataTransfer, nativeEvent }
        dz.addEventListener('sp-dropzone-drop', function (e) {
            var detail = e.detail;
            draggedState.textContent = 'false';

            var label = detail.source === 'picker' ? 'file picker' : 'sp-dropzone-drop';

            if (detail.rejected) {
                statusSuffix.textContent = ' from your computer';
                lastEvent.textContent = label + ' → rejected by filter (' + dz.accept + ')';
                droppedFilename.textContent = '';
                return;
            }

            var names = (detail.files || []).map(function (f) { return f.name; });
            if (names.length === 0) {
                droppedFilename.textContent = '';
                lastEvent.textContent = label + ' (no files)';
            } else {
                droppedFilename.textContent = 'Selected: ' + names.join(', ');
                lastEvent.textContent = label + ' (' + names.length + ' file' + (names.length !== 1 ? 's' : '') + ')';
            }
            statusSuffix.textContent = ' from your computer';
        });
    }

    if (tabName === 'sp-overlay') {
        const placementListener = `
            document.getElementById("placementselection").addEventListener("change", () => {
                document.querySelectorAll(".overlay").forEach((overlay) => {
                    overlay.placement = document.getElementById("placementselection").value;
                  });
            });
            `;
        eval(placementListener);

        const offsetListener = `
            document.getElementById("offsetvalue").addEventListener("input", () => {
                document.querySelectorAll(".overlay").forEach((overlay) => {
                    overlay.offset = document.getElementById("offsetvalue").value;
                });
            });
            `;

        eval(offsetListener);
    }
}

function handleThemeColor(selectObject) {
    var value = selectObject.value;
    document.querySelector('#theme-block').setAttribute('color', value);
}

function handleThemeScale(selectObject) {
    var value = selectObject.value;
    document.querySelector('#theme-block').setAttribute('scale', value);
}

// logging events
function logEvent(evt) {
    const eventType = evt.type;
    const filterElement = document.querySelector(`#chk${eventType}`);
    if (!filterElement.checked) return;
    const logs = document.querySelector('#logs');
    let key = evt.key === ' ' ? 'Space' : evt.key;

    let evtText =
        `EVENT=${evt.type} CONTROL=${evt.currentTarget.tagName.toLowerCase()}` +
        `${
            evt.currentTarget.value !== undefined
                ? ` VALUE=${evt.currentTarget.value}`
                : ''
        }` +
        `${
            evt.target.checked !== undefined
                ? ` CHECKED=${evt.target.checked}`
                : ''
        }` +
        `${
            evt.target.selectedIndex !== undefined
                ? ` SELECTED=${evt.target.selectedIndex}`
                : ''
        }` +
        `${key !== undefined ? ` KEY=${key}` : ''}` +
        `${evt.charCode !== undefined ? ` CHAR=${evt.charCode}` : ''}` +
        `<br>`;

    logs.innerHTML += evtText;
}

function toggleEventListenerToSpControls(toggle = 'add') {
    ['click', 'focus', 'blur', 'input', 'change', 'keydown', 'keyup'].forEach(
        (evtName) => {
            Array.from(document.querySelectorAll('*')).forEach((control) => {
                if (
                    control._nodeName !== 'sp-theme' &&
                    control._nodeName.startsWith('sp-')
                ) {
                    if (toggle === 'add') {
                        control.addEventListener(evtName, logEvent);
                    } else if (toggle === 'remove') {
                        control.removeEventListener(evtName, logEvent);
                    }
                }
            });
        }
    );
}

function mainControl() {
    document
        .querySelector('#toggleConsole')
        .addEventListener('change', (evt) => {
            const selected = evt.target.selected;
            if (selected) {
                toggleEventListenerToSpControls('add');
            } else {
                toggleEventListenerToSpControls('remove');
            }
        });

    document.querySelector('#clearConsole').addEventListener('click', () => {
        var logs = document.getElementById('logs');
        logs.innerText = '';
    });
}

function reset() {
    const toggleConsole = document.getElementById('toggleConsole');
    const changeEvent = new Event('change', { bubbles: true });
    toggleConsole.removeAttribute('selected');
    toggleConsole.dispatchEvent(changeEvent);
}
