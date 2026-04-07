export type ThemeColorShades = { 500: string; 600: string; 700: string; 800: string };

export type ColorThemePreset = {
	name: string;
	primary: string;
	colors: ThemeColorShades;
};

export const COLOR_THEME_PRESETS: ColorThemePreset[] = [
	{ name: 'Purple', primary: 'purple', colors: { 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6' } },
	{ name: 'Blue', primary: 'blue', colors: { 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af' } },
	{ name: 'Green', primary: 'green', colors: { 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46' } },
	{ name: 'Pink', primary: 'pink', colors: { 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d' } },
	{ name: 'Orange', primary: 'orange', colors: { 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412' } },
	{ name: 'Red', primary: 'red', colors: { 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b' } },
	{ name: 'Indigo', primary: 'indigo', colors: { 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3' } },
	{ name: 'Teal', primary: 'teal', colors: { 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59' } },
];
