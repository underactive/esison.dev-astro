import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getGitHubProjects } from './github-projects';

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
