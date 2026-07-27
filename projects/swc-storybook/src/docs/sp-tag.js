/**
 * API reference data for sp-tag.
 * Sourced from docs/TAG_API.md
 */
export const TAG_DOC = {
    tag: 'sp-tag',
    slug: 'tag',
    title: 'sp-tag',
    wrapper: '@swc-uxp-wrappers/tags@3.0.0',
    upstream: '@spectrum-web-components/tags@1.12.0',
    summary:
        'An individual tag representing a keyword, category, or person. Extends SpectrumElement directly (no button semantics) and supports a deletable affordance, avatar/icon slots, and standard sizing.',
    attributes: [
        {
            name: 'size',
            kind: 'enum',
            values: ['s', 'm', 'l'],
            description: 'Tag size via SizedMixin',
            control: true,
        },
        {
            name: 'deletable',
            kind: 'boolean',
            default: false,
            description: 'Shows a delete affordance; fires delete on activation',
            control: true,
        },
        {
            name: 'disabled',
            kind: 'boolean',
            default: false,
            description: 'Disables interaction',
            control: true,
        },
        {
            name: 'readonly',
            kind: 'boolean',
            default: false,
            description: 'Not focusable/operable via keyboard or mouse',
            control: true,
        },
        {
            name: 'invalid',
            kind: 'boolean',
            description: 'Error/invalid visual treatment (CSS hook, not a declared property)',
            control: true,
        },
    ],
    events: [
        {
            name: 'delete',
            type: 'Event',
            description: 'Delete affordance activated (only when deletable is set)',
            bubbles: true,
        },
        {
            name: 'focus',
            type: 'FocusEvent',
            description: 'Tag received focus',
            bubbles: true,
        },
        {
            name: 'blur',
            type: 'FocusEvent',
            description: 'Tag lost focus',
            bubbles: true,
        },
        {
            name: 'keydown',
            type: 'KeyboardEvent',
            description: 'Key pressed while focused',
            bubbles: true,
        },
    ],
    slots: [
        { name: '', description: 'Text content for labeling the tag' },
        { name: 'avatar', description: 'An sp-avatar element to display within the tag' },
        { name: 'icon', description: 'An icon element to display within the tag' },
    ],
    uxpNotes: [
        'No UXP-specific limitations documented (unlike sp-button\'s pending state).',
        'Import via: import \'@swc-uxp-wrappers/tags/sp-tag.js\';',
    ],
    playground: {
        content: 'Preview tag',
        iconSlotTag: 'sp-icon-edit',
    },
};
