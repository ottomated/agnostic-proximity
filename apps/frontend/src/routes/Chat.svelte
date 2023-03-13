<script lang="ts">
	import {
		audioAllowed,
		audioSettings,
		closeStream,
		getMicrophone,
		setStreamEnabled,
	} from '$lib/audio';
	import type { GameState } from 'common';
	import type Peer from 'peerjs';
	import { onDestroy } from 'svelte';
	import type { Writable } from 'svelte/store';
	import Player from '$lib/Player.svelte';
	import MyPlayer from '$lib/MyPlayer.svelte';
	import { myId } from '$lib/socket';

	export let peer: Peer;
	export let gameState: Writable<GameState>;

	const audio = new AudioContext();
	const micPromise = getMicrophone(audio);
	let micStream: MediaStream | undefined;
	micPromise.then((mic) => (micStream = mic.stream));

	$: if ($audioAllowed) audio.resume();

	$: setStreamEnabled(
		micStream,
		!$audioSettings.muted && !$audioSettings.deafened
	);

	onDestroy(() => {
		audio.close();
		micPromise.then((mic) => closeStream(mic.stream));
	});
</script>

<main
	class="bg-slate-900 text-white w-full h-screen flex flex-col items-center justify-center"
>
	{#await micPromise}
		<div>Waiting for microphone access...</div>
	{:then mic}
		{#if $audioAllowed}
			<ul class="list-disc">
				{#each $gameState.players as player (player.id)}
					{#if player.id === $myId}
						<MyPlayer {player} {audio} />
					{:else}
						<Player {peer} {gameState} {player} mic={mic.stream} {audio} />
					{/if}
				{/each}
			</ul>
		{:else}
			<button>Click to connect</button>
		{/if}
	{:catch error}
		<div class="justify-self-center">
			Microphone Error: {error.message}
		</div>
	{/await}
	<div class="flex gap-4">
		<label>
			<input type="checkbox" bind:checked={$audioSettings.muted} />
			Mute
		</label>
		<label>
			<input type="checkbox" bind:checked={$audioSettings.deafened} />
			Deafen
		</label>
	</div>
	<button on:click={() => ($myId = '')}>Change user</button>
</main>
