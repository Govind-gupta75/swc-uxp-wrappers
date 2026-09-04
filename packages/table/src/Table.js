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

import { Table } from '@swc-uxp-internal/table/src/Table.js';

import styles from './uxp-table.css.js';

class UxpTable extends Table {
    static get styles() {
        // We are combining our styles to make all super class styles available along with the transitive dependent classes styles.
        return [...super.styles, styles];
    }

    willUpdate(changedProperties) {
        if (!this.hasUpdated) {
            // UXP's querySelector does not support the :scope pseudo-class used in
            // manageSelects() to check for existing checkbox cells. When selects is
            // set in the initial HTML, both manageCheckboxes() and manageSelects()
            // would run on the first update — manageSelects() fails its duplicate
            // guard and inserts a second checkbox cell per row.
            // Fix: on the first render, run only validateSelected() + manageCheckboxes()
            // (which correctly handles all checkbox insertion). manageSelects() is
            // deferred to subsequent updates where manageCheckboxes() no longer runs.
            this.validateSelected();
            this.manageCheckboxes();
            return;
        }
        super.willUpdate(changedProperties);
    }

    handleChange(changeEvent) {
        // Only override the base implementation for the two cases confirmed
        // broken under UXP: a row's own checkbox while selects="multiple" or
        // selects="single". The head "Select All" checkbox (parentElement is
        // sp-table-head, so isRowCheckbox is false) was confirmed working
        // correctly on-device: it has no TableRow listener in its bubble path
        // to race with, so it was never actually affected by the bug below.
        const target = changeEvent.target;
        const rowItem = target.parentElement;
        const isRowCheckbox = rowItem?.localName === 'sp-table-row';
        if (
            (this.selects !== 'multiple' && this.selects !== 'single') ||
            !isRowCheckbox
        ) {
            super.handleChange(changeEvent);
            return;
        }

        // The base implementation tracks selection via rowItem.selected
        // (single mode also uses it to decide whether to deselect every other
        // row) and, for single mode, relies on TableRow's own async
        // manageSelected() to visually uncheck the previously-selected row's
        // checkbox-cell. Both depend on TableRow's own handleChange /
        // reactive update cycle having already completed for this same
        // event — an ordering/timing UXP doesn't reliably preserve, so both
        // can silently drift or lag. Instead: read the clicked checkbox's own
        // ground-truth `checked` state directly (no ordering dependency,
        // since it's set synchronously and self-contained by the click), and
        // — for single mode — directly and synchronously set every row
        // checkbox-cell's `checked` property ourselves rather than trusting
        // the indirect async chain to do it.
        changeEvent.stopPropagation();
        const previousSelectedSet = new Set(this.selectedSet);
        const previousSelected = [...this.selected];
        const rows = this.tableRows;

        if (this.selects === 'single') {
            const checked = !!(target.checkbox && target.checkbox.checked);
            rows.forEach((row) => {
                const shouldBeSelected = checked && row === rowItem;
                row.selected = shouldBeSelected;
                const [cell] = row.checkboxCells || [];
                if (cell) {
                    cell.checked = shouldBeSelected;
                }
            });
            this.selectedSet = checked ? new Set([rowItem.value]) : new Set();
            this.selected = [...this.selectedSet];
        } else {
            const selectedValues = rows
                .filter((row) => {
                    const [cell] = row.checkboxCells || [];
                    return !!(cell && cell.checkbox && cell.checkbox.checked);
                })
                .map((row) => row.value);
            this.selectedSet = new Set(selectedValues);
            this.selected = selectedValues;

            if (this.tableHeadCheckboxCell) {
                const total = rows.length;
                const selectedCount = selectedValues.length;
                this.tableHeadCheckboxCell.checked =
                    total > 0 && selectedCount === total;
                this.tableHeadCheckboxCell.indeterminate =
                    selectedCount > 0 && selectedCount < total;
            }
        }

        const applyDefault = this.dispatchEvent(
            new Event('change', {
                cancelable: true,
                bubbles: true,
                composed: true,
            })
        );
        if (!applyDefault) {
            changeEvent.preventDefault();
            this.selectedSet = previousSelectedSet;
            this.selected = previousSelected;
        }
    }
}

export { UxpTable as Table };
