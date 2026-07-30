export const PHOSPHOR_STORAGE_KEY = 'phosphor';

export interface Phosphor {
	id: 'green' | 'amber' | 'cyan' | 'white';
	label: string;
	/** Historic CRT phosphor designation, shown as a secondary label. */
	code: string;
	swatch: string;
}

/**
 * The default phosphor is represented by the *absence* of a `data-phosphor`
 * attribute — its values are the base custom properties on `:root` in
 * terminal.css, and every other phosphor is an attribute rule that overrides
 * them. A corrupt or unknown stored value therefore matches no rule and renders
 * as the default, so nothing needs to validate it at paint time.
 *
 * Changing this value means moving the corresponding token block into `:root`
 * and giving the old default its own `[data-phosphor='...']` rule.
 */
export const DEFAULT_PHOSPHOR: Phosphor['id'] = 'green';

export const PHOSPHORS: Phosphor[] = [
	{ id: 'green', label: 'Green', code: 'P1', swatch: '#33ff33' },
	{ id: 'amber', label: 'Amber', code: 'P3', swatch: '#ffb000' },
	{ id: 'cyan', label: 'Cyan', code: '\u2014', swatch: '#22d3ee' },
	{ id: 'white', label: 'White', code: 'P4', swatch: '#e8e8e8' },
];

/** Phosphors that need an attribute set — everything except the `:root` default. */
export const NON_DEFAULT_PHOSPHOR_IDS = PHOSPHORS.filter(
	(phosphor) => phosphor.id !== DEFAULT_PHOSPHOR,
).map((phosphor) => phosphor.id);

const PHOSPHOR_IDS = PHOSPHORS.map((phosphor) => phosphor.id) as string[];

export function isPhosphorId(value: string): value is Phosphor['id'] {
	return PHOSPHOR_IDS.includes(value);
}
