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
		theme: 'dark',
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

export function createRevealContactClient(deps: RevealContactClientDeps) {
	const callAPI = async (payload: Record<string, unknown>) => {
		const response = await fetch('/.netlify/functions/reveal_contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})

		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({}))) as { error?: string }
			throw new Error(errorData.error || `Server error: ${response.status}`)
		}

		return response.json()
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
