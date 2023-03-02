<script lang="ts">
	import { Smile } from 'lucide-svelte';
	import type { Player } from 'common';

	export let player: Player;
	export let audio: AudioContext;

	$: pos = player.position;

	$: audio.listener?.positionX.setValueAtTime(pos[0], audio.currentTime);
	$: audio.listener?.positionY.setValueAtTime(pos[1], audio.currentTime);
	$: audio.listener?.positionZ.setValueAtTime(pos[2], audio.currentTime);

	$: dirVector = {
		x:
			2 *
			(player.rotation[0] * player.rotation[2] +
				player.rotation[3] * player.rotation[1]),
		y:
			2 *
			(player.rotation[1] * player.rotation[2] -
				player.rotation[3] * player.rotation[0]),
		z:
			1 -
			2 *
				(player.rotation[0] * player.rotation[0] +
					player.rotation[1] * player.rotation[1]),
	};

	$: audio.listener?.forwardX.setValueAtTime(dirVector.x, audio.currentTime);
	$: audio.listener?.forwardY.setValueAtTime(dirVector.y, audio.currentTime);
	$: audio.listener?.forwardZ.setValueAtTime(dirVector.z, audio.currentTime);
</script>

<li class="flex items-center gap-2">
	<Smile class="text-purple-400" />
	Me
</li>
