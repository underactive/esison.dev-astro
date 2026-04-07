import { describe, expect, it } from 'vitest';
import {
	readBoolean,
	readDate,
	readNonEmptyString,
	readNumber,
	readStringArray,
	readUrlString,
} from './github-projects';

describe('readNonEmptyString', () => {
	it('returns null for missing, non-string, or blank values', () => {
		expect(readNonEmptyString({}, 'k')).toBeNull();
		expect(readNonEmptyString({ k: 1 }, 'k')).toBeNull();
		expect(readNonEmptyString({ k: '   ' }, 'k')).toBeNull();
	});

	it('returns trimmed non-empty strings', () => {
		expect(readNonEmptyString({ k: '  x  ' }, 'k')).toBe('x');
	});
});

describe('readBoolean', () => {
	it('is true only when the value is strictly true', () => {
		expect(readBoolean({ a: true }, 'a')).toBe(true);
		expect(readBoolean({ a: false }, 'a')).toBe(false);
		expect(readBoolean({ a: 'true' }, 'a')).toBe(false);
	});
});

describe('readNumber', () => {
	it('returns finite numbers and zero for invalid values', () => {
		expect(readNumber({ n: 3 }, 'n')).toBe(3);
		expect(readNumber({ n: NaN }, 'n')).toBe(0);
		expect(readNumber({ n: '1' }, 'n')).toBe(0);
	});
});

describe('readDate', () => {
	it('parses ISO strings and returns null for invalid or missing values', () => {
		expect(readDate({ d: '2024-01-02T00:00:00.000Z' }, 'd')?.toISOString()).toBe(
			'2024-01-02T00:00:00.000Z',
		);
		expect(readDate({ d: 'not-a-date' }, 'd')).toBeNull();
		expect(readDate({}, 'd')).toBeNull();
	});
});

describe('readStringArray', () => {
	it('collects trimmed non-empty strings and skips non-strings', () => {
		expect(readStringArray({ t: [' a ', '', 'b', 2] }, 't')).toEqual(['a', 'b']);
		expect(readStringArray({ t: 'x' }, 't')).toEqual([]);
	});
});

describe('readUrlString', () => {
	it('returns http(s) URLs when parseable', () => {
		expect(readUrlString({ u: 'https://example.com/path' }, 'u')).toBe('https://example.com/path');
	});

	it('with allowProtocolFallback prepends https for host-only values', () => {
		expect(readUrlString({ u: 'example.com' }, 'u', { allowProtocolFallback: true })).toBe(
			'https://example.com/',
		);
	});

	it('returns undefined for invalid or non-http(s) schemes', () => {
		expect(readUrlString({ u: 'ftp://example.com' }, 'u')).toBeUndefined();
		expect(readUrlString({ u: '%%%' }, 'u')).toBeUndefined();
	});
});
