<script lang="ts">
	import { createPeer, myId } from '$lib/socket';
	import { createQuery } from '@tanstack/svelte-query';
	import Chat from './Chat.svelte';

	export let data;

	const peerPromise = createPeer($myId, data.token);
</script>

{#await peerPromise then [peer, gameState]}
	<Chat {peer} {gameState} />
{/await}
