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

import { TextfieldBase } from '@swc-uxp-internal/textfield/src/Textfield.js';

import styles from './uxp-textfield.css.js';

class UxpTextfieldBase extends TextfieldBase {
    static get styles() {
        // We are combining our styles to make all super class styles available along with the transitive dependent classes styles.
        return [...super.styles, styles];
    }

    /**
     * UXP selects/replaces input text when Lit re-syncs the `.value=${live(...)}`
     * binding on each keystroke. Skip re-renders during active editing for fields
     * that do not need live layout updates; restore selection for growing textareas.
     */
    handleInput(_event) {
        if (this.allowedKeys && this.inputElement.value) {
            const regExp = new RegExp(`^[${this.allowedKeys}]*$`, 'u');
            if (!regExp.test(this.inputElement.value)) {
                const nextSelectStart = this.inputElement.selectionStart - 1;
                this.inputElement.value = this.value.toString();
                this.inputElement.setSelectionRange(
                    nextSelectStart,
                    nextSelectStart
                );
                return;
            }
        }

        const newValue = this.inputElement.value;
        if (newValue === this.value) {
            return;
        }

        const oldValue = this._value;
        this._value = newValue;

        if (this.focused && this.inputElement) {
            this._uxpInputSelection = {
                start: this.inputElement.selectionStart ?? newValue.length,
                end: this.inputElement.selectionEnd ?? newValue.length,
            };
        }

        if (this._uxpShouldDeferValueRender()) {
            return;
        }

        this.requestUpdate('value', oldValue);
    }

    _uxpShouldDeferValueRender() {
        return this.focused && !(this.multiline && this.grows);
    }

    onBlur(_event) {
        const shouldSyncRender = this._uxpShouldDeferValueRender();
        super.onBlur(_event);
        this._uxpInputSelection = null;
        if (shouldSyncRender) {
            this.requestUpdate('value');
        }
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        if (
            !this.focused ||
            !this._uxpInputSelection ||
            !this.inputElement
        ) {
            return;
        }

        const shouldRestoreSelection =
            changedProperties.has('value') ||
            changedProperties.has('invalid') ||
            changedProperties.has('valid');

        if (!shouldRestoreSelection) {
            return;
        }

        const { start, end } = this._uxpInputSelection;
        const input = this.inputElement;
        const restoreSelection = () => {
            const length = input.value.length;
            input.setSelectionRange(
                Math.min(start, length),
                Math.min(end, length)
            );
        };

        restoreSelection();
        requestAnimationFrame(restoreSelection);
        this.updateComplete.then(restoreSelection);
    }
}

class UxpTextfield extends UxpTextfieldBase {}

export { UxpTextfield as Textfield };
export { UxpTextfieldBase as TextfieldBase };
