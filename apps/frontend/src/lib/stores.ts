import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import { uneval } from 'devalue';

export function storedWritable<T>(
	key: string,
	initialValue: T | (() => T)
): Writable<T> {
	let initial: T | undefined;

	if (browser) {
		const stored = localStorage.getItem(key);
		if (stored) {
			console.log(key, stored);
			initial = (0, eval)(`(${stored})`);
		}
	}

	if (!initial) {
		if (typeof initialValue === 'function') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			initial = initialValue();
		} else {
			initial = initialValue;
		}
	}

	const store = writable<T>(initial);

	store.subscribe((value) => {
		if (!browser) return;
		localStorage.setItem(key, uneval(value));
	});
	return store;
}
