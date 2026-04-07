import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getGitHubProjects, readUrlString, readBoolean, readNumber, readDate, readStringArray, readNonEmptyString } from './github-projects';

describe('getGitHubProjects', () => {
	let originalEnv: any;

	beforeEach(() => {
		originalEnv = import.meta.env;
		// @ts-ignore
		import.meta.env = {
			ENABLE_GITHUB_PROJECTS: 'true',
			GITHUB_TOKEN: 'fake-token',
		};
		global.fetch = vi.fn();
	});

	afterEach(() => {
		// @ts-ignore
		import.meta.env = originalEnv;
		vi.restoreAllMocks();
	});

	it('returns empty array when ENABLE_GITHUB_PROJECTS is false', async () => {
		// @ts-ignore
		import.meta.env.ENABLE_GITHUB_PROJECTS = 'false';
		const result = await getGitHubProjects();
		expect(result).toEqual({ enabled: false, projects: [] });
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it('handles successful multi-page fetches', async () => {
		const validProject = {
			name: 'valid-project',
			html_url: 'https://github.com/user/valid',
			pushed_at: '2023-01-01T00:00:00Z',
			topics: ['portfolio'],
		};
		const invalidProject = {
			name: 'invalid-project',
			html_url: 'https://github.com/user/invalid',
			pushed_at: '2023-01-01T00:00:00Z',
			topics: ['other'],
		};

		// First page returns 100 items to trigger pagination, but only 2 are valid
		const page1 = Array(98).fill(invalidProject).concat([validProject, validProject]);
		// Second page returns fewer than 100 items, ending pagination
		const page2 = [validProject];

		(global.fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => page1,
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => page2,
			});

		const result = await getGitHubProjects();
		expect(result.enabled).toBe(true);
		expect(result.projects).toHaveLength(3);
		expect(global.fetch).toHaveBeenCalledTimes(2);
	});

	it('handles API error responses (401, 403, 429)', async () => {
		for (const status of [401, 403, 429]) {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status,
			});

			const result = await getGitHubProjects();
			expect(result.enabled).toBe(true);
			expect(result.projects).toEqual([]);
			expect(result.errorMessage).toContain('GitHub rejected the API request');
		}
	});

	it('handles malformed JSON payloads', async () => {
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => {
				throw new Error('Invalid JSON');
			},
		});

		const result = await getGitHubProjects();
		expect(result.enabled).toBe(true);
		expect(result.projects).toEqual([]);
		expect(result.errorMessage).toContain('GitHub returned unexpected repository data');
	});

	it('filters repositories without the portfolio topic', async () => {
		const validProject = {
			name: 'valid-project',
			html_url: 'https://github.com/user/valid',
			pushed_at: '2023-01-01T00:00:00Z',
			topics: ['portfolio'],
		};
		const invalidProject = {
			name: 'invalid-project',
			html_url: 'https://github.com/user/invalid',
			pushed_at: '2023-01-01T00:00:00Z',
			topics: ['other-topic'],
		};

		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => [validProject, invalidProject],
		});

		const result = await getGitHubProjects();
		expect(result.enabled).toBe(true);
		expect(result.projects).toHaveLength(1);
		expect(result.projects[0].name).toBe('valid-project');
	});
});

describe('readUrlString', () => {
	it('returns undefined for missing or empty values', () => {
		expect(readUrlString({}, 'url')).toBeUndefined();
		expect(readUrlString({ url: '' }, 'url')).toBeUndefined();
		expect(readUrlString({ url: '   ' }, 'url')).toBeUndefined();
		expect(readUrlString({ url: null }, 'url')).toBeUndefined();
	});

	it('returns valid https URLs', () => {
		expect(readUrlString({ url: 'https://example.com' }, 'url')).toBe('https://example.com/');
		expect(readUrlString({ url: 'http://example.com' }, 'url')).toBe('http://example.com/');
	});

	it('ignores invalid URLs', () => {
		expect(readUrlString({ url: 'not-a-url' }, 'url')).toBeUndefined();
		expect(readUrlString({ url: 'ftp://example.com' }, 'url')).toBeUndefined();
	});

	it('handles protocol fallback when enabled', () => {
		expect(readUrlString({ url: 'example.com' }, 'url', { allowProtocolFallback: true })).toBe('https://example.com/');
		expect(readUrlString({ url: 'example.com/path' }, 'url', { allowProtocolFallback: true })).toBe('https://example.com/path');
	});

	it('does not fallback if protocol fallback is disabled', () => {
		expect(readUrlString({ url: 'example.com' }, 'url')).toBeUndefined();
	});
});

describe('readBoolean', () => {
	it('returns true only for boolean true', () => {
		expect(readBoolean({ val: true }, 'val')).toBe(true);
		expect(readBoolean({ val: false }, 'val')).toBe(false);
		expect(readBoolean({ val: 'true' }, 'val')).toBe(false);
		expect(readBoolean({}, 'val')).toBe(false);
	});
});

describe('readNumber', () => {
	it('returns number for valid finite numbers', () => {
		expect(readNumber({ val: 42 }, 'val')).toBe(42);
		expect(readNumber({ val: 0 }, 'val')).toBe(0);
	});
	it('returns 0 for invalid numbers', () => {
		expect(readNumber({ val: '42' }, 'val')).toBe(0);
		expect(readNumber({ val: NaN }, 'val')).toBe(0);
		expect(readNumber({ val: Infinity }, 'val')).toBe(0);
		expect(readNumber({}, 'val')).toBe(0);
	});
});

describe('readDate', () => {
	it('returns Date for valid date strings', () => {
		const d = readDate({ val: '2023-01-01T12:00:00Z' }, 'val');
		expect(d).toBeInstanceOf(Date);
		expect(d?.toISOString()).toBe('2023-01-01T12:00:00.000Z');
	});
	it('returns null for invalid dates', () => {
		expect(readDate({ val: 'not-a-date' }, 'val')).toBeNull();
		expect(readDate({ val: '' }, 'val')).toBeNull();
		expect(readDate({}, 'val')).toBeNull();
	});
});

describe('readStringArray', () => {
	it('returns array of trimmed strings', () => {
		expect(readStringArray({ val: [' a ', 'b', 1, null, ' c'] }, 'val')).toEqual(['a', 'b', 'c']);
	});
	it('returns empty array for invalid input', () => {
		expect(readStringArray({ val: 'not-array' }, 'val')).toEqual([]);
		expect(readStringArray({}, 'val')).toEqual([]);
	});
});

describe('readNonEmptyString', () => {
	it('returns trimmed string', () => {
		expect(readNonEmptyString({ val: '  hello  ' }, 'val')).toBe('hello');
	});
	it('returns null for empty or invalid strings', () => {
		expect(readNonEmptyString({ val: '   ' }, 'val')).toBeNull();
		expect(readNonEmptyString({ val: 123 }, 'val')).toBeNull();
		expect(readNonEmptyString({}, 'val')).toBeNull();
	});
});
