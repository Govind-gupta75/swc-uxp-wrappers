const BASE_EVENTS = ['click', 'focus', 'blur', 'keydown', 'keyup'];

let loggingEnabled = false;

function isSpControl(node) {
    return (
        node.tagName &&
        node.tagName.toLowerCase().startsWith('sp-') &&
        node.tagName.toLowerCase() !== 'sp-theme'
    );
}

// Walk up from the event target to find the nearest sp-* element. Delegating from a
// stable ancestor (instead of attaching a listener directly to each control) means
// logging keeps working after the matrix/controls are rebuilt (e.g. the "Clear" button,
// or switching tabs) — no re-attachment step needed for newly created elements.
function findSpAncestor(node) {
    let el = node;
    while (el && el.nodeType === 1) {
        if (isSpControl(el)) return el;
        el = el.parentElement;
    }
    return null;
}

function formatLogLine(evt, control) {
    const key = evt.key === ' ' ? 'Space' : evt.key;
    let line = `EVENT=${evt.type} CONTROL=${control.tagName.toLowerCase()}`;

    if (control.value !== undefined) {
        line += ` VALUE=${control.value}`;
    }
    if (control.checked !== undefined) {
        line += ` CHECKED=${control.checked}`;
    }
    if (key !== undefined && evt.type.startsWith('key')) {
        line += ` KEY=${key}`;
    }
    return line;
}

function handleDelegatedEvent(evt) {
    if (!loggingEnabled) return;

    const control = findSpAncestor(evt.target);
    if (!control) return;

    const filter = document.querySelector(`#chk-${evt.type}`);
    if (filter && !filter.checked) return;

    const logs = document.querySelector('#logs');
    if (!logs) return;

    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = formatLogLine(evt, control);
    logs.appendChild(line);
    logs.scrollTop = logs.scrollHeight;
}

// `focus`/`blur` don't bubble, so delegation only works via the capture phase.
// addEventListener is a no-op for a name+capture combo that's already registered, so
// calling this repeatedly (once per tab's custom events) is safe.
function watchEventNames(names) {
    for (const name of names) {
        document.addEventListener(name, handleDelegatedEvent, true);
    }
}

export function renderEventFilters(doc) {
    const container = document.getElementById('event-filters');
    if (!container) return;
    container.textContent = '';

    const names = [...BASE_EVENTS];
    for (const evt of doc?.events || []) {
        if (!names.includes(evt.name)) names.push(evt.name);
    }

    for (const name of names) {
        const label = document.createElement('label');
        label.className = 'filter';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `chk-${name}`;
        checkbox.checked = true;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(name));
        container.appendChild(label);
    }

    watchEventNames(names);
}

export function initEventConsole() {
    const toggle = document.getElementById('toggle-console');
    const clearBtn = document.getElementById('clear-console');

    watchEventNames(BASE_EVENTS);

    toggle?.addEventListener('click', () => {
        loggingEnabled = !loggingEnabled;
        toggle.classList.toggle('active', loggingEnabled);
    });

    clearBtn?.addEventListener('click', () => {
        const logs = document.getElementById('logs');
        if (logs) logs.textContent = '';
    });
}

export function resetEventConsole(doc) {
    const toggle = document.getElementById('toggle-console');
    loggingEnabled = false;
    if (toggle) toggle.classList.remove('active');
    renderEventFilters(doc);
}
