import type { ZodSchema } from 'zod';

export function writable<T>(schema: ZodSchema<T>, initial: T) {
	const subscribers: Array<(value: T) => void> = [];
	let value = initial;
	return {
		subscribe: (subscriber: (value: T) => void) => {
			subscribers.push(subscriber);
			subscriber(value);
			return () => {
				const index = subscribers.indexOf(subscriber);
				if (index !== -1) subscribers.splice(index, 1);
			};
		},
		set: (newValue: T) => {
			const res = schema.safeParse(newValue);
			if (!res.success) {
				console.warn(res.error);
				return;
			}
			value = res.data;
			subscribers.forEach((subscriber) => subscriber(value));
		},
		update: (fn: (old: T) => T) => {
			const res = schema.safeParse(fn(value));
			if (!res.success) {
				console.warn(res.error);
				return;
			}
			value = res.data;
			subscribers.forEach((subscriber) => subscriber(value));
		},
		get: () => value,
	};
}
