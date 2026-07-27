/**
 * API reference data for sp-divider.
 * Sourced from docs/DIVIDER_API.md
 */
export const DIVIDER_DOC = {
    tag: 'sp-divider',
    slug: 'divider',
    title: 'sp-divider',
    wrapper: '@swc-uxp-wrappers/divider@3.0.0',
    upstream: '@spectrum-web-components/divider@1.12.0',
    summary:
        'Separates and distinguishes sections of content or groups of menu items. Non-interactive; supports horizontal/vertical orientation, sizing, and static color variants.',
    attributes: [
        {
            name: 'size',
            kind: 'enum',
            values: ['s', 'm', 'l'],
            default: 'm',
            description: 'Divider size via SizedMixin, restricted to s/m/l for this component',
            control: true,
        },
        {
            name: 'static-color',
            kind: 'enum',
            values: ['white', 'black'],
            description: 'Static color variant for busy/photographic backgrounds',
            control: true,
        },
        {
            name: 'vertical',
            kind: 'boolean',
            default: false,
            description: 'Renders a vertical divider instead of horizontal',
            control: true,
        },
    ],
    events: [],
    slots: [],
    uxpNotes: [
        'Vertical dividers need align-self: stretch; height: auto; via CSS to render visibly inside a flex row.',
        'Import via: import \'@swc-uxp-wrappers/divider/sp-divider.js\';',
    ],
    playground: {
        content: '',
        iconSlotTag: 'sp-icon-edit',
    },
};
