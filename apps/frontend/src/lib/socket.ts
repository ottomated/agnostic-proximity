import { env } from '$env/dynamic/public';
import type { GameState } from 'common';
import Peer from 'peerjs';
import { writable } from 'svelte/store';
import { storedWritable } from './stores';

export const myId = storedWritable('playerId', () => crypto.randomUUID());

export function createPeer(id: string, token: string) {
	let ws: WebSocket | undefined;

	const gameState = writable<GameState>({
		players: [],
		falloffDistance: 10,
	});

	const peer = new Peer(id, {
		host: env.PUBLIC_BACKEND_HOST,
		port: Number(env.PUBLIC_BACKEND_PORT),
		key: token,
		path: '/proximity',
		config: {
			iceServers: [
				{ urls: 'stun:stun.l.google.com:19302' },
				{
					urls: `turn:${env.PUBLIC_TURN_IP}:3478`,
					username: 'coturn',
					credential: token,
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
	return [peer, gameState] as const;
}
