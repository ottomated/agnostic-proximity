import { PeerServer } from 'peer';
import { writable } from './store';
import { defaultGameState, gameStateSchema } from 'common';

const peerServer = PeerServer({
	port: 9000,
	path: '/proximity',
	alive_timeout: Infinity,
});

const state = writable(gameStateSchema, {
	GameState: defaultGameState,
});

const clients: { send: (v: string) => void }[] = [];

state.subscribe((state) => {
	clients.forEach((client) => {
		client.send(JSON.stringify(state));
	});
});

peerServer.on('connection', (client) => {
	const ws = client.getSocket();
	if (!ws) return;
	clients.push(ws);
	ws.addEventListener('message', (event) => {
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
	const index = clients.indexOf(ws);
	if (index === -1) return;
	clients.splice(index, 1);
});

console.log('Listening');
