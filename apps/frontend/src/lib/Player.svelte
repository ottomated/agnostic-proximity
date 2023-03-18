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
	import { audioSettings, closeStream, SMOOTHING } from './audio';
	import type { GameState, Player } from 'common';
	import type { Writable } from 'svelte/store';
	import { rotateVectorByQuat } from './MyPlayer.svelte';

	export let gameState: Writable<GameState>;
	export let peer: Peer;
	export let me: Player | undefined;
	export let player: Player;
	export let mic: MediaStream;
	export let audio: AudioContext;

	let call: MediaConnection | undefined;

	function setupCall() {
		if (!call) return;
		call.on('error', (e) => {
			console.error('call error', e);
		});
		call.on('iceStateChanged', (state) => {
			console.log('ice state changed', state);
		});
		call.on('close', () => {
			console.log('call closed');
		});
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
		peer.on('error', console.warn);
		peer.on('close', console.warn);
		peer.on('disconnected', console.warn);
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
		// const osc = new OscillatorNode(audio, { type: 'sine', frequency: 440 });
		// osc.start();

		// panner = audio.createPanner();
		// panner.panningModel = 'HRTF';
		// panner.distanceModel = 'linear';

		gain = audio.createGain();
		if (panner) {
			node.connect(panner);
			panner.connect(gain);
		} else {
			node.connect(gain);
		}
		gain.connect(audio.destination);
		state = 'connected';
	}

	let audioElement: HTMLAudioElement;
	let stream: MediaStream | undefined;
	let node: MediaStreamAudioSourceNode | undefined;
	let panner: PannerNode | undefined;
	let gain: GainNode | undefined;

	const forward = { x: 0, y: 0, z: 1 };
	$: if (panner) {
		const pos = player.position;
		const rot = rotateVectorByQuat(forward, player.rotation);
		panner.positionX.setTargetAtTime(pos.x, 0, SMOOTHING);
		panner.positionY.setTargetAtTime(pos.y, 0, SMOOTHING);
		panner.positionZ.setTargetAtTime(pos.z, 0, SMOOTHING);
		panner.orientationX.setTargetAtTime(rot.x, 0, SMOOTHING);
		panner.orientationY.setTargetAtTime(rot.y, 0, SMOOTHING);
		panner.orientationZ.setTargetAtTime(rot.z, 0, SMOOTHING);
	}

	$: settings = $gameState.audioSettings;
	$: if (panner) panner.maxDistance = settings.maxDistance;
	$: if (panner) panner.refDistance = settings.refDistance;
	$: if (panner) panner.rolloffFactor = settings.rolloffFactor;
	$: if (panner) panner.coneInnerAngle = settings.coneInnerAngle;
	$: if (panner) panner.coneOuterAngle = settings.coneOuterAngle;
	$: if (panner) panner.coneOuterGain = settings.coneOuterGain;

	$: if (panner) {
		gain?.gain.setValueAtTime(
			$audioSettings.deafened
				? 0
				: player.volume * settings.staticGainMultiplier,
			audio.currentTime
		);
	} else if (me) {
		const distance = Math.sqrt(
			Math.pow(player.position.x - me.position.x, 2) +
				Math.pow(player.position.y - me.position.y, 2) +
				Math.pow(player.position.z - me.position.z, 2)
		);
		// ramp from 1 to 0 as it goes from refDistance to maxDistance
		const distanceRamp = Math.max(
			0,
			Math.min(
				1,
				1 -
					(distance - settings.refDistance) /
						(settings.maxDistance - settings.refDistance)
			)
		);
		gain?.gain.setValueAtTime(
			$audioSettings.deafened ? 0 : player.volume * distanceRamp,
			audio.currentTime
		);
	}

	function destroy() {
		call?.close();
		closeStream(stream);
		node?.disconnect();
		panner?.disconnect();
		if (audioElement) audioElement.srcObject = null;
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
	{player.name}
</li>
