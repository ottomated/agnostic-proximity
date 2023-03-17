<script lang="ts" context="module">
	type Vector = { x: number; y: number; z: number };
	type Quaternion = { x: number; y: number; z: number; w: number };
	/**
	 *
	 * @param quat The quaternion to convert
	 * @returns An array of 6 numbers, representing the forward and up vectors
	 */
	function getVectors(quat: Quaternion): [Vector, Vector] {
		const forward = rotateVectorByQuat({ x: 0, y: 0, z: -1 }, quat);
		const up = rotateVectorByQuat({ x: 0, y: 1, z: 0 }, quat);
		return [forward, up];
	}
	function rotateVectorByQuat(vec: Vector, quat: Quaternion): Vector {
		const s = quat.w;

		const dot1 = dot(quat, vec);
		const dot2 = dot(quat, quat);
		const cross1 = cross(quat, vec);
		const x = 2 * dot1 * quat.x + (s * s - dot2) * vec.x + 2 * s * cross1.x;
		const y = 2 * dot1 * quat.y + (s * s - dot2) * vec.y + 2 * s * cross1.y;
		const z = 2 * dot1 * quat.z + (s * s - dot2) * vec.z + 2 * s * cross1.z;
		return { x, y, z };
	}

	function dot(vec1: Vector, vec2: Vector): number {
		return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
	}
	function cross(vec1: Vector, vec2: Vector): Vector {
		return {
			x: vec1.y * vec2.z - vec1.z * vec2.y,
			y: vec1.z * vec2.x - vec1.x * vec2.z,
			z: vec1.x * vec2.y - vec1.y * vec2.x,
		};
	}
</script>

<script lang="ts">
	import { Smile } from 'lucide-svelte';
	import type { Player } from 'common';

	export let player: Player;
	export let audio: AudioContext;

	const isModern = 'positionX' in AudioListener.prototype;

	const setPosition = isModern
		? (pos: Vector) => {
				const now = audio.currentTime;
				audio.listener.positionX.setValueAtTime(pos.x, now);
				audio.listener.positionY.setValueAtTime(pos.y, now);
				audio.listener.positionZ.setValueAtTime(pos.z, now);
		  }
		: (pos: Vector) => {
				audio.listener.setPosition(pos.x, pos.y, pos.z);
		  };

	const setOrientation = isModern
		? (quat: Quaternion) => {
				const now = audio.currentTime;
				const [forward, up] = getVectors(quat);
				audio.listener.forwardX.setValueAtTime(forward.x, now);
				audio.listener.forwardY.setValueAtTime(forward.y, now);
				audio.listener.forwardZ.setValueAtTime(forward.z, now);
				audio.listener.upX.setValueAtTime(up.x, now);
				audio.listener.upY.setValueAtTime(up.y, now);
				audio.listener.upZ.setValueAtTime(up.z, now);
		  }
		: (quat: Quaternion) => {
				const vec = getVectors(quat);
				audio.listener.setOrientation(
					vec[0].x,
					vec[0].y,
					vec[0].z,
					vec[1].x,
					vec[1].y,
					vec[1].z
				);
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
