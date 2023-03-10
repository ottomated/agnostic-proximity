<script lang="ts">
	import { createPeer, myId } from '$lib/socket';
	import { createQuery } from '@tanstack/svelte-query';
	import type { GameState } from 'common';
	import type Peer from 'peerjs';
	import type { Writable } from 'svelte/store';
	import type { PageData } from './$types';
	import Chat from './Chat.svelte';

	export let data: PageData;

	const peer = createQuery({
		queryKey: ['peer'],
		queryFn: () => createPeer($myId, data.token),
	});
</script>

{#if $peer.isSuccess}
	<Chat myId={$myId} peer={$peer.data[0]} gameState={$peer.data[1]} />
{/if}
