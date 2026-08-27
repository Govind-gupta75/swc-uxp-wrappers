const ICON_ONLY_ATTR = 'icon-only';
const DEFAULT_ICON_TAG = 'sp-icon-edit';

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function hasIconSlot(doc) {
    return (doc.slots || []).some((slot) => slot.name === 'icon');
}

function clearChildren(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

export function componentLabel(doc) {
    const bare = doc.title.replace(/^sp-/, '');
    return bare.charAt(0).toUpperCase() + bare.slice(1);
}

function controllableAttrs(doc, kind) {
    return doc.attributes.filter((a) => a.control !== false && (!kind || a.kind === kind));
}

// ---- Header: title + tag pill + counts, all derived from doc data ----

function renderHeader(doc) {
    const header = el('div', 'comp-header');
    header.id = `comp-header-${doc.slug}`;

    const titleRow = el('div', 'comp-title-row');
    const title = el('h2', 'comp-title', componentLabel(doc));
    title.id = `comp-title-${doc.slug}`;
    titleRow.appendChild(title);
    titleRow.appendChild(el('span', 'comp-tag-pill', doc.tag));
    header.appendChild(titleRow);

    const enumCount = controllableAttrs(doc, 'enum').length;
    const boolCount = controllableAttrs(doc, 'boolean').length;
    const eventCount = (doc.events || []).length;
    const slotCount = (doc.slots || []).length;
    const defaultSlotCount = (doc.slots || []).some((s) => s.name === '') ? 1 : 0;

    const meta = el(
        'div',
        'comp-meta',
        `ref: ${doc.wrapper} · ${enumCount} enum · ${boolCount} bool · ${eventCount} events · slots ${slotCount}/${defaultSlotCount}`
    );
    meta.id = `comp-meta-${doc.slug}`;
    header.appendChild(meta);
    return header;
}

// ---- Variant matrix: rows/cols picked from enum attributes, built as flexbox rows of
// divs (never <table>, never CSS Grid set via JS — both are known to break in UXP's
// renderer; see project_uxp_layout_gotchas memory). The controls below this grid mutate
// these same rendered instances directly (their row/col axis attribute stays fixed per
// cell; every other attribute is shared across all cells). ----

function pickMatrixAxes(doc) {
    const enums = controllableAttrs(doc, 'enum');
    const rowAxis = enums.find((a) => a.name === 'size') || enums[0] || null;
    const colAxis = enums.find((a) => a !== rowAxis) || null;
    return { rowAxis, colAxis };
}

function applyStateToInstance(doc, state, touchedEnums, instance, rowAxis, colAxis) {
    for (const attr of controllableAttrs(doc)) {
        if (attr === rowAxis || attr === colAxis) continue;
        const value = state[attr.name];
        if (attr.kind === 'boolean') {
            if (value) instance.setAttribute(attr.name, '');
            else instance.removeAttribute(attr.name);
        } else if (attr.kind === 'enum' && !touchedEnums.has(attr.name)) {
            // Leave untouched enum controls alone: some values (e.g. sp-button's
            // deprecated variant="white"/"black") make the component set a related
            // attribute (static-color) internally on its own. Forcibly clearing that
            // attribute here — just because the user hasn't picked a static-color
            // override yet — would clobber the component's own derived state.
            continue;
        } else if (value) {
            instance.setAttribute(attr.name, value);
        } else {
            instance.removeAttribute(attr.name);
        }
    }

    const iconOnly = !!state[ICON_ONLY_ATTR];
    clearChildren(instance);

    const showIcon = hasIconSlot(doc) && (state.showIcon || iconOnly);
    if (showIcon) {
        const iconTag = doc.playground?.iconSlotTag || DEFAULT_ICON_TAG;
        const icon = document.createElement(iconTag);
        icon.setAttribute('slot', 'icon');
        instance.appendChild(icon);
    }

    if (!iconOnly) {
        instance.appendChild(document.createTextNode(componentLabel(doc)));
    }
}

function buildMatrixInstance(doc, rowAxis, rowValue, colAxis, colValue) {
    const instance = document.createElement(doc.tag);
    if (rowAxis) instance.setAttribute(rowAxis.name, rowValue);
    if (colAxis) instance.setAttribute(colAxis.name, colValue);
    instance.id = `matrix-${doc.slug}-${rowValue || 'x'}-${colValue || 'x'}`;
    instance.textContent = componentLabel(doc);
    return instance;
}

function matrixRow(cells, extraClass) {
    const row = el('div', extraClass ? `matrix-grid-row ${extraClass}` : 'matrix-grid-row');
    for (const { content, className } of cells) {
        const cell = el('div', className ? `matrix-grid-cell ${className}` : 'matrix-grid-cell');
        if (content instanceof Node) cell.appendChild(content);
        else if (content !== undefined) cell.textContent = content;
        row.appendChild(cell);
    }
    return row;
}

function renderMatrix(doc) {
    const { rowAxis, colAxis } = pickMatrixAxes(doc);
    const section = el('div', 'matrix-block');
    section.id = `matrix-block-${doc.slug}`;
    section.appendChild(el('div', 'matrix-block-title', 'Variant Matrix'));

    const descParts = [];
    if (rowAxis) descParts.push(`rows: ${rowAxis.name}`);
    if (colAxis) descParts.push(`cols: ${colAxis.name}`);
    if (descParts.length) {
        section.appendChild(el('span', 'matrix-block-desc', descParts.join(' — ')));
    }

    const instances = [];
    if (!rowAxis) {
        // No enum attributes at all (e.g. a future component with only booleans) — fall
        // back to a single instance so controls still have something to act on.
        const instance = buildMatrixInstance(doc, null, null, null, null);
        instances.push({ instance, rowValue: null, colValue: null });
        section.appendChild(instance);
        return { section, instances, rowAxis, colAxis };
    }

    const grid = el('div', 'matrix-grid');
    grid.id = `matrix-grid-${doc.slug}`;
    const cols = colAxis ? colAxis.values : [null];

    const cornerLabel = colAxis ? `${rowAxis.name} \\ ${colAxis.name}` : rowAxis.name;
    grid.appendChild(
        matrixRow(
            [
                { content: cornerLabel, className: 'matrix-axis-cell' },
                ...cols.map((colValue) => ({ content: colValue || componentLabel(doc) })),
            ],
            'matrix-grid-header'
        )
    );

    for (const rowValue of rowAxis.values) {
        const rowCells = cols.map((colValue) => {
            const instance = buildMatrixInstance(doc, rowAxis, rowValue, colAxis, colValue);
            instances.push({ instance, rowValue, colValue });
            return { content: instance };
        });
        grid.appendChild(matrixRow([{ content: rowValue, className: 'matrix-axis-cell' }, ...rowCells]));
    }

    section.appendChild(grid);
    return { section, instances, rowAxis, colAxis };
}

// ---- Controls: pill toggles / choice groups / text inputs, driving every instance in
// the matrix above simultaneously (their row/col axis value stays fixed per cell). ----

function createTogglePill(id, label, deprecated, isActive, onToggle) {
    const btn = el('button', 'pill');
    btn.type = 'button';
    btn.id = id;
    btn.appendChild(el('span', '', label));
    if (deprecated) btn.appendChild(el('span', 'pill-badge', 'DEPRECATED'));
    btn.classList.toggle('pill-active', isActive());
    btn.addEventListener('click', () => {
        onToggle();
        btn.classList.toggle('pill-active', isActive());
    });
    return btn;
}

function createChoicePillGroup(groupId, values, getValue, setValue) {
    const row = el('div', 'pill-row');
    row.id = groupId;
    const buttons = [];

    function refresh() {
        for (const { btn, value } of buttons) {
            btn.classList.toggle('pill-active', value === getValue());
        }
    }

    for (const value of ['', ...values]) {
        const btn = el('button', 'pill', value === '' ? '— none' : value);
        btn.type = 'button';
        btn.id = `${groupId}-${value || 'none'}`;
        btn.addEventListener('click', () => {
            setValue(value);
            refresh();
        });
        buttons.push({ btn, value });
        row.appendChild(btn);
    }

    refresh();
    return row;
}

function renderControls(doc, matrix) {
    const { instances, rowAxis, colAxis } = matrix;
    const panel = el('div', 'live-controls');
    panel.id = `live-controls-${doc.slug}`;
    panel.appendChild(el('div', 'live-controls-title', 'Controls'));

    const state = {};
    const touchedEnums = new Set();
    for (const attr of controllableAttrs(doc)) {
        if (attr === rowAxis || attr === colAxis) continue;
        state[attr.name] = attr.kind === 'boolean' ? false : attr.default ?? '';
    }
    if (hasIconSlot(doc)) state.showIcon = false;

    const sync = () => {
        for (const { instance } of instances) {
            applyStateToInstance(doc, state, touchedEnums, instance, rowAxis, colAxis);
        }
    };

    const boolAttrs = controllableAttrs(doc, 'boolean');
    if (boolAttrs.length || hasIconSlot(doc)) {
        const group = el('div', 'control-group control-group-wide');
        group.appendChild(el('div', 'control-group-label', 'Toggles'));
        const row = el('div', 'pill-row');
        for (const attr of boolAttrs) {
            row.appendChild(
                createTogglePill(
                    `ctrl-${doc.slug}-${attr.name}`,
                    attr.name,
                    !!attr.deprecated,
                    () => state[attr.name],
                    () => {
                        state[attr.name] = !state[attr.name];
                        sync();
                    }
                )
            );
        }
        if (hasIconSlot(doc)) {
            row.appendChild(
                createTogglePill(
                    `ctrl-${doc.slug}-icon`,
                    'Show icon',
                    false,
                    () => state.showIcon,
                    () => {
                        state.showIcon = !state.showIcon;
                        sync();
                    }
                )
            );
        }
        group.appendChild(row);
        panel.appendChild(group);
    }

    for (const attr of controllableAttrs(doc, 'enum')) {
        if (attr === rowAxis || attr === colAxis) continue;
        const group = el('div', 'control-group');
        group.appendChild(
            el(
                'div',
                'control-group-label',
                attr.name + (attr.deprecated ? ' (deprecated)' : '')
            )
        );
        group.appendChild(
            createChoicePillGroup(
                `ctrl-${doc.slug}-${attr.name}`,
                attr.values,
                () => state[attr.name],
                (value) => {
                    state[attr.name] = value;
                    touchedEnums.add(attr.name);
                    sync();
                }
            )
        );
        panel.appendChild(group);
    }

    for (const attr of controllableAttrs(doc, 'string')) {
        const group = el('div', 'control-group');
        group.appendChild(el('div', 'control-group-label', attr.name));
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `ctrl-${doc.slug}-${attr.name}`;
        input.placeholder = attr.name;
        input.addEventListener('input', () => {
            state[attr.name] = input.value;
            sync();
        });
        group.appendChild(input);
        if (attr.description) {
            group.appendChild(el('div', 'control-group-hint', attr.description));
        }
        panel.appendChild(group);
    }

    panel.appendChild(el('div', 'control-group-label', 'Events'));
    panel.appendChild(
        el(
            'div',
            'live-controls-events',
            `Listening: ${(doc.events || []).map((e) => e.name).join(', ')}`
        )
    );

    const clearBtn = el('button', 'clear-btn', 'Clear');
    clearBtn.type = 'button';
    clearBtn.id = `clear-${doc.slug}`;
    clearBtn.addEventListener('click', () => {
        // Rebuild the matrix instances from scratch too (not just this panel's state) —
        // some values (e.g. deprecated variant="white"/"black") make the component derive
        // other attributes internally at creation time, which a fresh instance recreates
        // correctly rather than trying to hand-reset every possible side effect.
        renderDocExplorer(panel.parentNode, doc);
    });
    panel.appendChild(clearBtn);

    sync();
    return panel;
}

export function renderDocExplorer(root, doc) {
    root.textContent = '';
    root.appendChild(renderHeader(doc));
    const matrix = renderMatrix(doc);
    root.appendChild(matrix.section);
    if (matrix.instances.length) {
        root.appendChild(renderControls(doc, matrix));
    }
}
