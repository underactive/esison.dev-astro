let lockCount = 0

export function acquireScrollLock(): void {
	lockCount++
	if (lockCount === 1) {
		document.body.style.overflow = 'hidden'
	}
}

export function releaseScrollLock(): void {
	if (lockCount > 0) {
		lockCount--
	}
	if (lockCount === 0) {
		document.body.style.overflow = ''
	}
}
