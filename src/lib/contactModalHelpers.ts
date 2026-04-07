declare global {
	interface Window {
		turnstile?: {
			render: (
				container: string | HTMLElement,
				options: {
					sitekey: string
					callback: (token: string) => void
					'error-callback'?: () => void
					theme?: 'light' | 'dark'
					size?: 'normal' | 'compact'
				}
			) => string
			reset: (widgetId?: string) => void
		}
	}
}

export function getTurnstileSiteKey(): string {
	const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY
	return siteKey || '1x00000000000000000000AA'
}

export function createTurnstileWidget(
	container: HTMLElement,
	callback: (token: string) => void,
	errorCallback: () => void
): string {
	if (!window.turnstile) throw new Error('Turnstile not available')

	return window.turnstile.render(container, {
		sitekey: getTurnstileSiteKey(),
		callback,
		'error-callback': errorCallback,
		theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
		size: 'normal'
	})
}

export function resetTurnstileWidget(widgetId?: string): void {
	if (widgetId && window.turnstile) {
		window.turnstile.reset(widgetId)
	}
}

export interface RevealContactClientDeps {
	getElapsedMs: () => number
	getHoneypotValue: () => string
}

const ERROR_MESSAGES: Record<string, string> = {
	'rate-limited': 'Too many attempts — please wait and try again.',
	'too-fast': 'Please slow down and try again.',
	'captcha-invalid': 'Verification failed — please try again.',
	'bot-detected': 'Verification failed.',
	'missing-contact-info': 'Contact info is temporarily unavailable.',
	'server-error': 'Something went wrong — please try again.',
}

export function createRevealContactClient(deps: RevealContactClientDeps) {
	const callAPI = async (payload: Record<string, unknown>) => {
		let response: Response
		try {
			response = await fetch('/.netlify/functions/reveal_contact', {
				method: 'POST',
				signal: AbortSignal.timeout(8000),
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
		} catch (err) {
			if (err instanceof DOMException && err.name === 'TimeoutError') {
				throw new Error('Request timed out — please try again')
			}
			throw err
		}

		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({}))) as { error?: string }
			const code = errorData.error ?? ''
			throw new Error(ERROR_MESSAGES[code] ?? `Server error: ${response.status}`)
		}

		let data: unknown
		try {
			data = await response.json()
		} catch {
			throw new Error('Invalid response — please try again.')
		}
		if (!data || typeof (data as Record<string, unknown>).email !== 'string') {
			throw new Error('Invalid response — please try again.')
		}
		return data as { email: string; phone?: string | null }
	}

	const getEmailInfo = async (token: string) => {
		const tNow = deps.getElapsedMs()
		const honeypot = deps.getHoneypotValue()

		return callAPI({
			token,
			tNow,
			honeypot
		})
	}

	const getPhoneInfo = async (phoneToken: string) => {
		const tNow = deps.getElapsedMs()
		const honeypot = deps.getHoneypotValue()

		return callAPI({
			token: '',
			phoneToken,
			includePhone: true,
			tNow,
			honeypot
		})
	}

	return { getEmailInfo, getPhoneInfo }
}
