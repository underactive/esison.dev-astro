import {
	GITHUB_PROJECTS_MAX_COUNT,
	GITHUB_PROJECTS_REQUIRED_TOPIC,
	GITHUB_USERNAME,
	SITE_TITLE,
} from '../consts';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_API_RESULTS_PAGE_SIZE = 100;
const GITHUB_API_TIMEOUT_MS = 5000;
const GITHUB_API_MAX_RETRIES = 2;
const GITHUB_API_RETRY_BASE_DELAY_MS = 1000;
const GITHUB_PROJECTS_DISABLED_VALUE = 'false';
const DEFAULT_DESCRIPTION = 'No description provided yet.';

export interface GitHubProject {
	name: string;
	description: string;
	repoUrl: string;
	homepageUrl?: string;
	language?: string;
	topics: string[];
	stars: number;
	pushedAt: Date;
}

export interface GitHubProjectsResult {
	enabled: boolean;
	projects: GitHubProject[];
	errorMessage?: string;
}

interface GitHubProjectCandidate extends GitHubProject {
	archived: boolean;
	disabled: boolean;
	fork: boolean;
	hasRequiredTopic: boolean;
}

/**
 * Fetches public GitHub repositories for the configured user and returns
 * those tagged with the required `portfolio` topic.
 *
 * Repositories are included only when they are public, non-fork,
 * non-archived, non-disabled, and carry the {@link GITHUB_PROJECTS_REQUIRED_TOPIC} topic.
 *
 * **Environment variables:**
 * - `ENABLE_GITHUB_PROJECTS` — set to `'false'` to disable the section
 *   entirely; the returned result will have `enabled: false` and an empty
 *   project list.
 * - `GITHUB_TOKEN` — optional Bearer token that raises GitHub API rate
 *   limits for build-time requests.
 *
 * Transient network failures and timeouts are retried up to
 * {@link GITHUB_API_MAX_RETRIES} times with exponential backoff.
 * Non-retryable HTTP errors (e.g. 401, 403, 429) return immediately
 * with `enabled: true` and an `errorMessage` describing the failure.
 *
 * @returns A {@link GitHubProjectsResult} — `enabled` indicates whether the
 *   section is active, `projects` contains the filtered list (capped at
 *   {@link GITHUB_PROJECTS_MAX_COUNT}), and `errorMessage` is set only when
 *   the section is enabled but data could not be loaded.
 */
export async function getGitHubProjects(): Promise<GitHubProjectsResult> {
	if (import.meta.env.ENABLE_GITHUB_PROJECTS === GITHUB_PROJECTS_DISABLED_VALUE) {
		return {
			enabled: false,
			projects: [],
		};
	}

	try {
		const projects: GitHubProject[] = [];
		let page = 1;
		let hasMoreProjects = true;

		while (projects.length < GITHUB_PROJECTS_MAX_COUNT && hasMoreProjects) {
			const response = await fetchWithRetry(buildGitHubReposUrl(page), buildGitHubHeaders());

			if (!response.ok) {
				console.warn(
					`[github-projects] GitHub API request failed with status ${response.status}.`,
				);

				return {
					enabled: true,
					projects: [],
					errorMessage: buildGitHubResponseErrorMessage(response.status),
				};
			}

			try {
				const payload = (await response.json()) as unknown;
				const parsed = parseGitHubProjectsPage(payload);

				for (const warning of parsed.warnings) {
					console.warn(`[github-projects] ${warning}`);
				}

				projects.push(...parsed.projects);
				hasMoreProjects = parsed.hasMoreProjects;
				page += 1;
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unknown error';
				console.warn(`[github-projects] Failed to parse GitHub repository data: ${message}`);

				return {
					enabled: true,
					projects: [],
					errorMessage:
						'GitHub projects are enabled, but GitHub returned unexpected repository data during this build.',
				};
			}
		}

		return {
			enabled: true,
			projects: projects.slice(0, GITHUB_PROJECTS_MAX_COUNT),
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.warn(`[github-projects] Failed to load GitHub projects: ${message}`);

		return {
			enabled: true,
			projects: [],
			errorMessage:
				'GitHub projects are enabled, but GitHub was unreachable during this build.',
		};
	}
}

function buildGitHubResponseErrorMessage(status: number): string {
	if (status === 401 || status === 403 || status === 429) {
		return 'GitHub projects are enabled, but GitHub rejected the API request during this build. Check GITHUB_TOKEN or GitHub API limits, then trigger a new build.';
	}

	return 'GitHub projects are enabled, but the repository list could not be loaded during this build.';
}

async function fetchWithRetry(url: URL, headers: Headers): Promise<Response> {
	let lastError: unknown;

	for (let attempt = 0; attempt <= GITHUB_API_MAX_RETRIES; attempt++) {
		try {
			return await fetch(url, {
				headers,
				signal: AbortSignal.timeout(GITHUB_API_TIMEOUT_MS),
			});
		} catch (error) {
			lastError = error;

			if (attempt < GITHUB_API_MAX_RETRIES) {
				const delay = GITHUB_API_RETRY_BASE_DELAY_MS * 2 ** attempt;
				console.warn(
					`[github-projects] Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms…`,
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError;
}

function buildGitHubHeaders(): Headers {
	const headers = new Headers({
		Accept: 'application/vnd.github+json',
		'User-Agent': SITE_TITLE,
		'X-GitHub-Api-Version': '2022-11-28',
	});

	const githubToken = import.meta.env.GITHUB_TOKEN?.trim();

	if (githubToken) {
		headers.set('Authorization', `Bearer ${githubToken}`);
	}

	return headers;
}

function buildGitHubReposUrl(page: number): URL {
	const url = new URL(`/users/${GITHUB_USERNAME}/repos`, GITHUB_API_BASE_URL);

	url.searchParams.set('type', 'public');
	url.searchParams.set('sort', 'pushed');
	url.searchParams.set('direction', 'desc');
	url.searchParams.set('per_page', String(GITHUB_API_RESULTS_PAGE_SIZE));
	url.searchParams.set('page', String(page));

	return url;
}

function parseGitHubProjectsPage(payload: unknown): {
	projects: GitHubProject[];
	warnings: string[];
	hasMoreProjects: boolean;
} {
	if (!Array.isArray(payload)) {
		throw new Error('GitHub API payload was not a repository array.');
	}

	const projects: GitHubProject[] = [];
	const warnings: string[] = [];

	for (const [index, rawItem] of payload.entries()) {
		const candidate = parseGitHubProject(rawItem);

		if (!candidate) {
			warnings.push(`Skipped repository result at index ${index} because it was missing required fields.`);
			continue;
		}

		if (!candidate.hasRequiredTopic || candidate.archived || candidate.disabled || candidate.fork) {
			continue;
		}

		const { archived: _, disabled: _d, fork: _f, hasRequiredTopic: _h, ...project } = candidate;
		projects.push(project);
	}

	return {
		projects,
		warnings,
		hasMoreProjects: payload.length === GITHUB_API_RESULTS_PAGE_SIZE,
	};
}

function parseGitHubProject(value: unknown): GitHubProjectCandidate | null {
	if (!isRecord(value)) {
		return null;
	}

	const name = readNonEmptyString(value, 'name');
	const repoUrl = readUrlString(value, 'html_url');
	const updatedAt = readDate(value, 'updated_at');
	const pushedAt = readDate(value, 'pushed_at') ?? updatedAt;
	const rawTopics = readStringArray(value, 'topics');

	if (!name || !repoUrl || !pushedAt) {
		return null;
	}

	return {
		name,
		description: readNonEmptyString(value, 'description') ?? DEFAULT_DESCRIPTION,
		repoUrl,
		homepageUrl: readUrlString(value, 'homepage', { allowProtocolFallback: true }),
		language: readNonEmptyString(value, 'language') ?? undefined,
		topics: rawTopics.filter((topic) => topic !== GITHUB_PROJECTS_REQUIRED_TOPIC),
		stars: readNumber(value, 'stargazers_count'),
		pushedAt,
		archived: readBoolean(value, 'archived'),
		disabled: readBoolean(value, 'disabled'),
		fork: readBoolean(value, 'fork'),
		hasRequiredTopic: rawTopics.includes(GITHUB_PROJECTS_REQUIRED_TOPIC),
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function readBoolean(record: Record<string, unknown>, key: string): boolean {
	return record[key] === true;
}

export function readNumber(record: Record<string, unknown>, key: string): number {
	const value = record[key];

	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function readDate(record: Record<string, unknown>, key: string): Date | null {
	const value = readNonEmptyString(record, key);

	if (!value) {
		return null;
	}

	const parsed = new Date(value);

	return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

export function readUrlString(
	record: Record<string, unknown>,
	key: string,
	options?: {
		allowProtocolFallback?: boolean;
	},
): string | undefined {
	const value = readNonEmptyString(record, key);

	if (!value) {
		return undefined;
	}

	const candidates = [value];

	if (options?.allowProtocolFallback && !value.includes('://')) {
		candidates.push(`https://${value}`);
	}

	for (const candidate of candidates) {
		if (!URL.canParse(candidate)) {
			continue;
		}

		const parsed = new URL(candidate);

		if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
			return parsed.toString();
		}
	}

	return undefined;
}

export function readStringArray(record: Record<string, unknown>, key: string): string[] {
	const value = record[key];

	if (!Array.isArray(value)) {
		return [];
	}

	return value.flatMap((item) => {
		if (typeof item !== 'string') {
			return [];
		}

		const trimmed = item.trim();
		return trimmed ? [trimmed] : [];
	});
}

export function readNonEmptyString(
	record: Record<string, unknown>,
	key: string,
): string | null {
	const value = record[key];

	if (typeof value !== 'string') {
		return null;
	}

	const trimmed = value.trim();
	return trimmed ? trimmed : null;
}
