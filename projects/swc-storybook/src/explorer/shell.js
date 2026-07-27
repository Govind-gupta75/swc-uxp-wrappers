import { componentLabel } from './render.js';

export function initDocsShell(registry, { onTabOpen } = {}) {
    const tabsContainer = document.getElementById('component-tabs');
    const panelsContainer = document.getElementById('component-tab-panels');
    if (!tabsContainer || !panelsContainer) return;

    const entries = Object.entries(registry);
    tabsContainer.textContent = '';
    panelsContainer.textContent = '';

    entries.forEach(([tagName, doc], index) => {
        const tabBtn = document.createElement('button');
        tabBtn.id = `tab-${doc.slug}`;
        tabBtn.className = 'tablinks' + (index === 0 ? ' active' : '');
        tabBtn.dataset.componentTag = tagName;
        tabBtn.textContent = componentLabel(doc);
        tabBtn.addEventListener('click', (evt) => {
            openTab(evt, tagName, onTabOpen);
        });
        tabsContainer.appendChild(tabBtn);

        const panel = document.createElement('div');
        panel.id = `panel-${doc.slug}`;
        panel.dataset.componentTag = tagName;
        panel.className = 'tabcontent';
        panel.style.display = index === 0 ? 'block' : 'none';

        const root = document.createElement('div');
        root.className = 'docs-explorer-root';
        root.id = `docs-root-${doc.slug}`;
        panel.appendChild(root);
        panelsContainer.appendChild(panel);
    });

    if (entries.length > 0) {
        onTabOpen?.(entries[0][0]);
    }
}

function openTab(evt, tagName, onTabOpen) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    const panel = document.querySelector(
        `#component-tab-panels [data-component-tag="${tagName}"]`
    );
    if (panel) panel.style.display = 'block';
    if (evt?.currentTarget) evt.currentTarget.className += ' active';

    onTabOpen?.(tagName);
}
