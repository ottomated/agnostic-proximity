<script lang="ts" context="module">
	type Vector = { x: number; y: number; z: number };
	type Quaternion = { x: number; y: number; z: number; w: number };
	/**
	 *
	 * @param quat The quaternion to convert
	 * @returns An array of 6 numbers, representing the forward and up vectors
	 */
	const f = { x: 0, y: 0, z: -1 };
	const u = { x: 0, y: 1, z: 0 };
	export function getVectors(quat: Quaternion): [Vector, Vector] {
		const forward = rotateVectorByQuat(f, quat);
		const up = rotateVectorByQuat(u, quat);
		return [forward, up];
	}
	export function rotateVectorByQuat(vec: Vector, quat: Quaternion): Vector {
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
	import { SMOOTHING } from './audio';

	export let player: Player;
	export let audio: AudioContext;

	const isModern = 'positionX' in AudioListener.prototype;

	const setPosition = isModern
		? (pos: Vector) => {
				audio.listener.positionX.setTargetAtTime(pos.x, 0, SMOOTHING);
				audio.listener.positionY.setTargetAtTime(pos.y, 0, SMOOTHING);
				audio.listener.positionZ.setTargetAtTime(pos.z, 0, SMOOTHING);
		  }
		: (pos: Vector) => {
				audio.listener.setPosition(pos.x, pos.y, pos.z);
		  };

	const setOrientation = isModern
		? (quat: Quaternion) => {
				const [forward, up] = getVectors(quat);
				audio.listener.forwardX.setTargetAtTime(forward.x, 0, SMOOTHING);
				audio.listener.forwardY.setTargetAtTime(forward.y, 0, SMOOTHING);
				audio.listener.forwardZ.setTargetAtTime(forward.z, 0, SMOOTHING);
				audio.listener.upX.setTargetAtTime(up.x, 0, SMOOTHING);
				audio.listener.upY.setTargetAtTime(up.y, 0, SMOOTHING);
				audio.listener.upZ.setTargetAtTime(up.z, 0, SMOOTHING);
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

	$: setPosition(player.position);

	$: setOrientation(player.rotation);
</script>

<li class="flex items-center gap-2">
	<Smile class="text-purple-400" />
	Me
</li>
