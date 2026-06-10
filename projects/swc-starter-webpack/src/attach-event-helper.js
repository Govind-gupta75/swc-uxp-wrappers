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
        (function () {
            var dz       = document.getElementById('dropzone-interactive');
            var stateEl  = document.getElementById('dz-dragged-state');
            var eventEl  = document.getElementById('dz-last-event');
            var fileEl   = document.getElementById('dz-dropped-filename');
            var selectEl = document.getElementById('dz-file-select-label');
            var effectEl = document.getElementById('dz-current-drop-effect');
            var acceptEl = document.getElementById('dz-current-accept-filter');
            if (!dz) return;

            var effectGroup = document.getElementById('dz-drop-effect-group');
            if (effectGroup) {
                effectGroup.addEventListener('change', function () {
                    var val = effectGroup.selected;
                    if (val) { dz.dropEffect = val; effectEl.textContent = val; }
                });
            }

            var acceptGroup = document.getElementById('dz-accept-filter-group');
            if (acceptGroup) {
                acceptGroup.addEventListener('change', function () {
                    var val = acceptGroup.selected;
                    var map = { all: '', image: 'image/*', text: 'text/*' };
                    dz.accept = map[val] !== undefined ? map[val] : '';
                    acceptEl.textContent = val;
                });
            }

            var rejectCheck = document.getElementById('dz-reject-all-check');
            dz.addEventListener('sp-dropzone-should-accept', function (e) {
                eventEl.textContent = 'sp-dropzone-should-accept';
                if (rejectCheck && rejectCheck.checked) { e.preventDefault(); }
            });

            var updateDragState = function () {
                stateEl.textContent = dz.hasAttribute('dragged') ? 'true' : 'false';
            };
            var obs = new MutationObserver(updateDragState);
            obs.observe(dz, { attributes: true, attributeFilter: ['dragged'] });
            dz.addEventListener('sp-dropzone-dragover',  function () { eventEl.textContent = 'sp-dropzone-dragover';  updateDragState(); });
            dz.addEventListener('sp-dropzone-dragleave', function () { eventEl.textContent = 'sp-dropzone-dragleave'; updateDragState(); });

            dz.addEventListener('sp-dropzone-drop', function (e) {
                updateDragState();
                var files    = e.detail.files;
                var source   = e.detail.source;
                var rejected = e.detail.rejected;
                eventEl.textContent = 'sp-dropzone-drop';
                if (rejected) {
                    fileEl.textContent = 'Rejected by accept filter';
                    fileEl.style.color = 'rgb(211,21,16)';
                } else if (!files || files.length === 0) {
                    fileEl.textContent = '(no files)';
                    fileEl.style.color = '';
                } else {
                    var names = files.map(function (f) { return f.name || f.nativePath || '(unknown)'; }).join(', ');
                    fileEl.textContent = '[' + source + '] ' + names;
                    fileEl.style.color = '';
                }
            });

            if (selectEl) {
                selectEl.addEventListener('click', function () { dz.openFilePicker({ multiple: true }); });
            }
        }());
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

function handleThemeSystem(selectObject) {
    var value = selectObject.value;
    document.querySelector('#theme-block').setAttribute('system', value);
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
