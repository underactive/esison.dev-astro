export const PHOSPHOR_STORAGE_KEY = 'phosphor';

export interface Phosphor {
	id: 'amber' | 'green' | 'cyan' | 'white';
	label: string;
	/** Historic CRT phosphor designation, shown as a secondary label. */
	code: string;
	swatch: string;
}

/**
 * `amber` is the default and is represented by the *absence* of a
 * `data-phosphor` attribute — the base values live on `:root` in terminal.css.
 * A corrupt or unknown stored value therefore renders as amber rather than
 * leaving accents unstyled.
 */
export const DEFAULT_PHOSPHOR: Phosphor['id'] = 'amber';

export const PHOSPHORS: Phosphor[] = [
	{ id: 'amber', label: 'Amber', code: 'P3', swatch: '#ffb000' },
	{ id: 'green', label: 'Green', code: 'P1', swatch: '#33ff33' },
	{ id: 'cyan', label: 'Cyan', code: '\u2014', swatch: '#22d3ee' },
	{ id: 'white', label: 'White', code: 'P4', swatch: '#e8e8e8' },
];

const PHOSPHOR_IDS = PHOSPHORS.map((phosphor) => phosphor.id) as string[];

export function isPhosphorId(value: string): value is Phosphor['id'] {
	return PHOSPHOR_IDS.includes(value);
}
