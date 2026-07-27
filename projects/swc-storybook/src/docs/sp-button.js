/**
 * API reference data for sp-button.
 * Sourced from projects/swc-component-docs/SPECTRUM_BUTTON_API.md
 */
export const BUTTON_DOC = {
    tag: 'sp-button',
    slug: 'button',
    title: 'sp-button',
    wrapper: '@swc-uxp-wrappers/button@3.0.0',
    upstream: '@spectrum-web-components/button@1.12.0',
    summary:
        'Represents an action a user can take. Supports visual variants, treatments, sizes, and standard DOM events.',
    attributes: [
        {
            name: 'variant',
            kind: 'enum',
            // CEM VALID_VARIANTS (1.12.0): white/black are deprecated aliases for
            // static-color, but genuinely accepted values, kept for CEM fidelity.
            values: ['accent', 'primary', 'secondary', 'negative', 'white', 'black'],
            default: 'accent',
            description:
                'Visual variant. "white"/"black" are deprecated: selecting them removes the variant attribute and sets static-color instead (with a console warning).',
            control: true,
        },
        {
            name: 'static-color',
            kind: 'enum',
            values: ['white', 'black'],
            description: 'Static color for busy backgrounds',
            control: true,
        },
        {
            name: 'treatment',
            kind: 'enum',
            values: ['fill', 'outline'],
            default: 'fill',
            description: 'Fill vs outline',
            deprecated: true,
            control: true,
        },
        {
            name: 'size',
            kind: 'enum',
            values: ['s', 'm', 'l', 'xl'],
            default: 'm',
            description: 'Button size via SizedMixin',
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
            name: 'pending',
            kind: 'boolean',
            default: false,
            description: 'Pending / loading state',
            control: true,
        },
        {
            name: 'pending-label',
            kind: 'string',
            default: 'Pending',
            description: 'Accessible label while pending',
            control: true,
        },
        {
            name: 'active',
            kind: 'boolean',
            default: false,
            description: 'Pressed visual state',
            control: true,
        },
        {
            name: 'quiet',
            kind: 'boolean',
            description: 'Outline shorthand; sets treatment="outline"',
            deprecated: true,
            control: true,
        },
        {
            name: 'no-wrap',
            kind: 'boolean',
            default: false,
            description: 'Disable label text wrapping',
            deprecated: true,
            control: true,
        },
        {
            name: 'type',
            kind: 'enum',
            values: ['button', 'submit', 'reset'],
            default: 'button',
            description: 'Native button behavior',
            control: false,
        },
        {
            name: 'label',
            kind: 'string',
            description: 'Accessible label for icon-only buttons',
            control: true,
        },
        {
            name: 'icon-only',
            kind: 'boolean',
            description: 'Icon-only layout',
            control: true,
        },
        {
            name: 'autofocus',
            kind: 'boolean',
            description: 'Focus on mount',
            control: false,
        },
    ],
    events: [
        {
            name: 'click',
            type: 'MouseEvent',
            description: 'User activates the button',
            bubbles: true,
        },
        {
            name: 'focus',
            type: 'FocusEvent',
            description: 'Button received focus',
            bubbles: true,
        },
        {
            name: 'blur',
            type: 'FocusEvent',
            description: 'Button lost focus',
            bubbles: true,
        },
        {
            name: 'keydown',
            type: 'KeyboardEvent',
            description: 'Key pressed while focused',
            bubbles: true,
        },
        {
            name: 'keypress',
            type: 'KeyboardEvent',
            description: 'Enter triggers click',
            bubbles: true,
        },
        {
            name: 'keyup',
            type: 'KeyboardEvent',
            description: 'Space release triggers click',
            bubbles: true,
        },
    ],
    slots: [
        { name: '', description: 'Text label content' },
        { name: 'icon', description: 'Icon before the label' },
    ],
    uxpNotes: [
        'pending is not fully supported in UXP — no spinner is shown.',
        'Import via: import \'@swc-uxp-wrappers/button/sp-button.js\';',
    ],
    playground: {
        content: 'Preview',
        iconSlotTag: 'sp-icon-edit',
    },
};
