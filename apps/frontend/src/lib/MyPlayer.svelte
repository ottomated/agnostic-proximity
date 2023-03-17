<script lang="ts" context="module">
	/**
	 *
	 * @param quat The quaternion to convert
	 * @returns An array of 6 numbers, representing the forward and up vectors
	 */
	function getVectors(
		quat: [number, number, number, number]
	): [number, number, number, number, number, number] {
		const forward = rotateVectorByQuat([0, 0, -1], quat);
		const up = rotateVectorByQuat([0, 1, 0], quat);
		return [...forward, ...up];
	}
	function rotateVectorByQuat(
		vec: [number, number, number],
		quat: [number, number, number, number]
	): [number, number, number] {
		const u = [quat[0], quat[1], quat[2]] as [number, number, number];
		const s = quat[3];

		const dot1 = dot(u, vec);
		const dot2 = dot(u, u);
		const cross1 = cross(u, vec);
		const x = 2 * dot1 * u[0] + (s * s - dot2) * vec[0] + 2 * s * cross1[0];
		const y = 2 * dot1 * u[1] + (s * s - dot2) * vec[1] + 2 * s * cross1[1];
		const z = 2 * dot1 * u[2] + (s * s - dot2) * vec[2] + 2 * s * cross1[2];
		return [x, y, z];
	}

	function dot(
		vec1: [number, number, number],
		vec2: [number, number, number]
	): number {
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
	}
	function cross(
		vec1: [number, number, number],
		vec2: [number, number, number]
	): [number, number, number] {
		return [
			vec1[1] * vec2[2] - vec1[2] * vec2[1],
			vec1[2] * vec2[0] - vec1[0] * vec2[2],
			vec1[0] * vec2[1] - vec1[1] * vec2[0],
		];
	}
</script>

<script lang="ts">
	import { Smile } from 'lucide-svelte';
	import type { Player } from 'common';

	export let player: Player;
	export let audio: AudioContext;

	const isModern = 'positionX' in AudioListener.prototype;

	const setPosition = isModern
		? (pos: [number, number, number]) => {
				const now = audio.currentTime;
				audio.listener.positionX.setValueAtTime(pos[0], now);
				audio.listener.positionY.setValueAtTime(pos[1], now);
				audio.listener.positionZ.setValueAtTime(pos[2], now);
		  }
		: (pos: [number, number, number]) => {
				audio.listener.setPosition(pos[0], pos[1], pos[2]);
		  };

	const setOrientation = isModern
		? (quat: [number, number, number, number]) => {
				const now = audio.currentTime;
				const vec = getVectors(quat);
				audio.listener.forwardX.setValueAtTime(vec[0], now);
				audio.listener.forwardY.setValueAtTime(vec[1], now);
				audio.listener.forwardZ.setValueAtTime(vec[2], now);
				audio.listener.upX.setValueAtTime(vec[3], now);
				audio.listener.upY.setValueAtTime(vec[4], now);
				audio.listener.upZ.setValueAtTime(vec[5], now);
		  }
		: (quat: [number, number, number, number]) => {
				const vec = getVectors(quat);
				audio.listener.setOrientation(...vec);
		  };

	$: pos = player.position;
	$: setPosition(pos);

	$: rot = player.rotation;
	$: setOrientation(rot);
</script>

<li class="flex items-center gap-2">
	<Smile class="text-purple-400" />
	Me
</li>
