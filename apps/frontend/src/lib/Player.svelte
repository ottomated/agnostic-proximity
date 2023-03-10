<script lang="ts" context="module">
	import {
		PhoneIncoming,
		PhoneOutgoing,
		PhoneOff,
		PhoneCall,
	} from 'lucide-svelte';

	type CallState = 'waiting' | 'calling' | 'answering' | 'closed' | 'connected';

	const iconMap = {
		waiting: ['text-yellow-500', PhoneIncoming],
		calling: ['text-yellow-500', PhoneOutgoing],
		answering: ['text-yellow-500', PhoneIncoming],
		closed: ['text-red-500', PhoneOff],
		connected: ['text-green-500', PhoneCall],
	} satisfies Record<
		CallState,
		[string, new (..._: any[]) => SvelteComponentTyped]
	>;
</script>

<script lang="ts">
	import type { MediaConnection, Peer } from 'peerjs';

	import { onDestroy, onMount, SvelteComponentTyped } from 'svelte';
	import { audioSettings, closeStream } from './audio';
	import type { GameState, Player } from 'common';
	import type { Writable } from 'svelte/store';

	export let gameState: Writable<GameState>;
	export let peer: Peer;
	export let player: Player;
	export let mic: MediaStream;
	export let audio: AudioContext;

	let call: MediaConnection | undefined;

	function setupCall() {
		if (!call) return;
		call.on('close', () => {
			state = 'closed';
			destroy();
			setTimeout(() => {
				if (call) return;
				state = 'calling';
				call = peer.call(player.id, mic);
				setupCall();
			}, Math.random() * 1001);
		});
		call.on('stream', onStream);
	}

	function onCall(c: MediaConnection) {
		if (c.peer !== player.id) return;
		destroy();
		call = c;
		state = 'answering';
		call.answer(mic);
		setupCall();
	}
	let state: CallState = 'waiting';

	onMount(() => {
		peer.on('call', onCall);
		setTimeout(() => {
			if (call) return;
			state = 'calling';
			call = peer.call(player.id, mic);
			setupCall();
		}, 500);
	});

	function onStream(s: MediaStream) {
		stream = s;
		audioElement.muted = true;
		audioElement.srcObject = stream;
		audioElement.play();
		node = audio.createMediaStreamSource(stream);
		// node.connect(audio.destination);
		panner = audio.createPanner();
		panner.panningModel = 'equalpower';
		panner.distanceModel = 'linear';
		gain = audio.createGain();
		node.connect(panner);
		panner.connect(gain);
		gain.connect(audio.destination);
		state = 'connected';
	}

	let audioElement: HTMLAudioElement;
	let stream: MediaStream | undefined;
	let node: MediaStreamAudioSourceNode | undefined;
	let panner: PannerNode | undefined;
	let gain: GainNode | undefined;

	$: panner?.positionX.setValueAtTime(player.position[0], audio.currentTime);
	$: panner?.positionY.setValueAtTime(player.position[1], audio.currentTime);
	$: panner?.positionZ.setValueAtTime(player.position[2], audio.currentTime);
	$: if (panner) panner.maxDistance = $gameState.falloffDistance;

	$: gain?.gain.setValueAtTime(
		$audioSettings.deafened ? 0 : player.volume,
		audio.currentTime
	);

	function destroy() {
		call?.close();
		closeStream(stream);
		node?.disconnect();
		panner?.disconnect();
		audioElement.srcObject = null;
		call = undefined;
		stream = undefined;
		node = undefined;
		panner = undefined;
		gain = undefined;
	}
	onDestroy(() => {
		peer.off('call', onCall);
		destroy();
	});
</script>

<audio class="hidden" playsinline bind:this={audioElement} muted />

<li class="flex items-center gap-2">
	<svelte:component this={iconMap[state][1]} class={iconMap[state][0]} />
	{player.id}
</li>
