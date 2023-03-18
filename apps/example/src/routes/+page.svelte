<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import type { GameState } from 'common';
	import { PUBLIC_HOST, PUBLIC_TOKEN } from '$env/static/public';

	type Player = {
		x: number;
		y: number;
		a: number;
		color: string;
	};

	let players: Player[] = [];
	let selectedPlayer = 0;

	const pressedKeys = new Set<string>();
	const justPressedKeys = new Set<string>();
	const mousePos = { x: 0, y: 0 };

	const host = `wss://backend-${PUBLIC_HOST}`;
	// const host = 'ws://localhost:9000';

	const socket = new WebSocket(
		`${host}/proximity/peerjs?key=${PUBLIC_TOKEN}&id=admin&token=token&version=1.4.7`
	);
	setInterval(() => {
		socket.send('{"type":"HEARTBEAT"}');
	}, 30 * 1000);

	function addPlayer() {
		players.push({
			x: Math.random() * window.innerWidth,
			y: Math.random() * window.innerHeight,
			a: Math.random() * 360,
			color: `hsl(${Math.random() * 360}, 100%, 30%)`,
		});
		players = players;
	}
	addPlayer();
	addPlayer();

	onMount(() => {
		const interval = setInterval(() => {
			for (let i = 0; i < players.length; i++) {
				if (justPressedKeys.has((i + 1).toString())) {
					selectedPlayer = i;
				}
			}
			if (justPressedKeys.has('0')) {
				addPlayer();
			}
			const player = players[selectedPlayer];
			const speed = 20;
			if (player) {
				if (pressedKeys.has('w')) {
					player.y -= speed;
				}
				if (pressedKeys.has('s')) {
					player.y += speed;
				}
				if (pressedKeys.has('a')) {
					player.x -= speed;
				}
				if (pressedKeys.has('d')) {
					player.x += speed;
				}
				player.a = Math.atan2(mousePos.y - player.y, mousePos.x - player.x);
				players[selectedPlayer] = player;
			}

			socket.send(
				JSON.stringify({
					GameState: {
						players: players.map((p, i) => ({
							id: i.toString(),
							name: `Player ${i}`,
							position: { x: p.x, y: 0, z: p.y },
							rotation: eulerToQuaternion(0, p.a + Math.PI / 2, 0),
							volume: 1,
						})),
						audioSettings: {
							refDistance: 20,
							maxDistance: 100,
							rolloffFactor: 1,
							coneInnerAngle: 90,
							coneOuterAngle: 180,
							coneOuterGain: 0.3,
							staticGainMultiplier: 1,
						},
					} satisfies GameState,
				})
			);

			justPressedKeys.clear();
		}, 1000 / 30);
		return () => clearInterval(interval);
	});

	function eulerToQuaternion(x: number, y: number, z: number) {
		const c1 = Math.cos(y / 2);
		const c2 = Math.cos(z / 2);
		const c3 = Math.cos(x / 2);
		const s1 = Math.sin(y / 2);
		const s2 = Math.sin(z / 2);
		const s3 = Math.sin(x / 2);

		return {
			x: c1 * c2 * c3 - s1 * s2 * s3,
			y: s1 * s2 * c3 + c1 * c2 * s3,
			z: s1 * c2 * c3 + c1 * s2 * s3,
			w: c1 * s2 * c3 - s1 * c2 * s3,
		};
	}
</script>

<svelte:window
	on:keydown={(e) => {
		pressedKeys.add(e.key);
		justPressedKeys.add(e.key);
	}}
	on:keyup={(e) => pressedKeys.delete(e.key)}
	on:mousemove={(e) => {
		mousePos.x = e.clientX;
		mousePos.y = e.clientY;
	}}
/>

<div class="fixed w-screen h-screen bg-slate-800">
	{#each players as player, i}
		<span
			style:background={player.color}
			style:transform="translate3d({player.x}px, {player.y}px, 0)"
			style:outline-color={selectedPlayer === i ? 'white' : 'transparent'}
			class="absolute rounded-full w-4 h-4 -top-2 -left-2 outline-2 outline"
		>
			<span
				style:transform="translate({Math.cos(player.a) * 10}px, {Math.sin(
					player.a
				) * 10}px)"
				class="absolute w-2 h-2 top-1 left-1 bg-white rounded-full"
			/>
		</span>
	{/each}
</div>
