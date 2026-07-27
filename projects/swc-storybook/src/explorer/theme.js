const THEME_OPTIONS = {
    spectrum: {
        colors: ['lightest', 'light', 'dark', 'darkest'],
        scales: ['medium', 'large'],
    },
    'spectrum-two': {
        colors: ['light', 'dark'],
        scales: ['medium', 'large'],
    },
};

function getThemeBlock() {
    return document.querySelector('#theme-block');
}

function labelize(value) {
    return value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function populateSelect(select, values, selected) {
    if (!select) return;
    select.textContent = '';
    for (const value of values) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = labelize(value);
        if (value === selected) option.selected = true;
        select.appendChild(option);
    }
}

function applyThemeSystem(system) {
    const theme = getThemeBlock();
    if (!theme) return;

    theme.setAttribute('system', system);

    const opts = THEME_OPTIONS[system] || THEME_OPTIONS['spectrum-two'];
    const colorSelect = document.getElementById('color-select');
    const scaleSelect = document.getElementById('scale-select');

    let color = theme.getAttribute('color') || opts.colors[0];
    if (!opts.colors.includes(color)) color = opts.colors[0];
    populateSelect(colorSelect, opts.colors, color);
    theme.setAttribute('color', color);

    let scale = theme.getAttribute('scale') || 'medium';
    if (!opts.scales.includes(scale)) scale = opts.scales[0];
    populateSelect(scaleSelect, opts.scales, scale);
    theme.setAttribute('scale', scale);
}

export function initThemeControls() {
    const systemSelect = document.getElementById('system-select');
    const colorSelect = document.getElementById('color-select');
    const scaleSelect = document.getElementById('scale-select');
    if (!systemSelect) return;

    systemSelect.addEventListener('change', () =>
        applyThemeSystem(systemSelect.value)
    );
    colorSelect?.addEventListener('change', () => {
        const theme = getThemeBlock();
        if (theme) theme.setAttribute('color', colorSelect.value);
    });
    scaleSelect?.addEventListener('change', () => {
        const theme = getThemeBlock();
        if (theme) theme.setAttribute('scale', scaleSelect.value);
    });

    applyThemeSystem(systemSelect.value);
}
