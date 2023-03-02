import { env } from '$env/dynamic/public';
import type { GameState } from 'common';
import Peer from 'peerjs';
import { writable } from 'svelte/store';
import { storedWritable } from './stores';

export const myId = storedWritable('playerId', () => crypto.randomUUID());
export const gameState = writable<GameState>({
	players: [],
	falloffDistance: 10,
});

export async function createPeer(id: string, token: string) {
	let ws: WebSocket | undefined;

	const expires = Date.now() + 1000 * 60 * 60 * 24;

	const signature = await crypto.subtle.sign(
		{
			name: 'HMAC',
			hash: 'SHA-1',
		},
		await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(token),
			{
				name: 'HMAC',
				hash: 'SHA-1',
			},
			false,
			['sign', 'verify']
		),
		new TextEncoder().encode(expires.toString())
	);
	// base64
	const signatureString = btoa(
		String.fromCharCode(...new Uint8Array(signature))
	);

	console.log(expires, signatureString);

	const peer = new Peer(id, {
		host: env.PUBLIC_BACKEND_HOST,
		port: Number(env.PUBLIC_BACKEND_PORT),
		key: token,
		path: '/proximity',
		config: {
			iceServers: [
				// { urls: 'stun:stun.l.google.com:19302' },
				{
					urls: `turn:${env.PUBLIC_TURN_IP}:3478`,
					username: expires.toString(),
					credential: signatureString,
				},
			],
		},
	});

	peer.socket.once('message', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		ws = (peer.socket as any)._socket as WebSocket;

		ws.addEventListener('message', (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.GameState) {
					gameState.set(data.GameState);
				}
			} catch (e) {
				console.error(e);
			}
		});
	});
	return peer;
}
