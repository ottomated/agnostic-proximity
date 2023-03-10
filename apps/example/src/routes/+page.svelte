<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import type { GameState } from 'common';

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

	const socket = new WebSocket(
		'wss://backend-proximity.mogultv.org/proximity/peerjs?key=pass&id=admin&token=token&version=1.4.7'
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
		const tick = () => {
			raf = requestAnimationFrame(tick);

			for (let i = 0; i < players.length; i++) {
				if (justPressedKeys.has((i + 1).toString())) {
					selectedPlayer = i;
				}
			}
			if (justPressedKeys.has('0')) {
				addPlayer();
			}
			const player = players[selectedPlayer];
			if (player) {
				if (pressedKeys.has('w')) {
					player.y -= 5;
				}
				if (pressedKeys.has('s')) {
					player.y += 5;
				}
				if (pressedKeys.has('a')) {
					player.x -= 5;
				}
				if (pressedKeys.has('d')) {
					player.x += 5;
				}
				player.a = Math.atan2(mousePos.y - player.y, mousePos.x - player.x);
				players[selectedPlayer] = player;
			}

			socket.send(
				JSON.stringify({
					GameState: {
						players: players.map((p, i) => ({
							id: i.toString(),
							name: i.toString(),
							position: [p.x, 0, p.y],
							rotation: eulerToQuaternion(0, p.a + Math.PI / 2, 0),
							volume: 1,
						})),
						falloffDistance: 100,
					} satisfies GameState,
				})
			);

			justPressedKeys.clear();
		};
		let raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	function eulerToQuaternion(x: number, y: number, z: number) {
		const c1 = Math.cos(y / 2);
		const c2 = Math.cos(z / 2);
		const c3 = Math.cos(x / 2);
		const s1 = Math.sin(y / 2);
		const s2 = Math.sin(z / 2);
		const s3 = Math.sin(x / 2);

		return [
			c1 * c2 * c3 - s1 * s2 * s3,
			s1 * s2 * c3 + c1 * c2 * s3,
			s1 * c2 * c3 + c1 * s2 * s3,
			c1 * s2 * c3 - s1 * c2 * s3,
		] as [number, number, number, number];
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
