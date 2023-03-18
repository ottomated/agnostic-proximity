import { readable } from 'svelte/store';
import { storedWritable } from './stores';

export const SMOOTHING = 0.2;

export const audioSettings = storedWritable('audioSettings', () => ({
	muted: false,
	deafened: false,
	inputVolume: 1,
}));

export async function getMicrophone(context: AudioContext) {
	const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
	const node = context.createMediaStreamSource(stream);
	return { stream, node };
}

export function closeStream(stream: MediaStream | undefined) {
	if (!stream) return;
	stream.getTracks().forEach((t) => t.stop());
}

export function setStreamEnabled(
	stream: MediaStream | undefined,
	enabled: boolean
) {
	if (!stream) return;
	stream.getTracks().forEach((t) => (t.enabled = enabled));
}

function canAutoplay() {
	const el = document.createElement('audio');
	el.setAttribute('playsinline', 'playsinline');
	el.src = '/_app/immutable/a.mp3';
	return new Promise<boolean>((resolve) => {
		const playResult = el.play();
		const timeout = setTimeout(() => {
			cleanup(false);
		}, 250);
		const cleanup = (res: boolean) => {
			resolve(res);
			clearTimeout(timeout);
			el.remove();
		};
		if (playResult !== undefined) {
			playResult.then(() => cleanup(true)).catch(() => cleanup(false));
		} else {
			cleanup(true);
		}
	});
}

export const audioAllowed = readable(false, (set) => {
	let succeeded = false;
	const check = async () => {
		const result = await canAutoplay();
		console.log(result);
		if (result) succeeded = true;
		set(result);
		if (succeeded) {
			clearInterval(interval);
		}
	};
	check();

	const interval = setInterval(check, 1000);

	window.addEventListener('click', check);
});
