import { PeerServer } from 'peer';
import { writable } from './store';
import { defaultGameState, gameStateSchema } from 'common';
import type { WebSocket } from 'ws';

const peerServer = PeerServer({
	port: 9000,
	path: '/proximity',
	alive_timeout: Infinity,
	key: process.env.AUTH_TOKEN,
});

const state = writable(gameStateSchema, {
	GameState: defaultGameState,
});

const clients = new Set<WebSocket>();

state.subscribe((state) => {
	clients.forEach((client) => {
		client.send(JSON.stringify(state));
	});
});

peerServer.get('/users', (req, res) => {
	if (req.header('Authorization') !== process.env.AUTH_TOKEN) {
		res.status(401).send('Unauthorized');
		return;
	}
	const { GameState } = state.get();
	const players = GameState.players.map((player) => ({
		id: player.id,
		name: player.name,
	}));
	res.header('Content-Type', 'application/json');
	res.send(JSON.stringify(players));
});

peerServer.on('connection', (client) => {
	const ws = client.getSocket();
	if (!ws) return;
	clients.add(ws);
	ws.addEventListener('message', (event) => {
		if (typeof event.data !== 'string') return;
		try {
			const data = JSON.parse(event.data);
			if (data.GameState) {
				state.set(data);
			}
		} catch (_) {
			/* noop */
		}
	});
	ws.send(JSON.stringify(state.get()));
});

peerServer.on('disconnect', (client) => {
	const ws = client.getSocket();
	if (!ws) return;
	clients.delete(ws);
});

console.log('Backend listening on 0.0.0.0:9000');
