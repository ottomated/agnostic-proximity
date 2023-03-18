<script lang="ts">
	import Login from '$lib/Login.svelte';
	import { myId } from '$lib/socket';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';

	export let data;

	let isChrome = false;
	onMount(() => {
		isChrome =
			typeof (window as unknown as { chrome: unknown }).chrome !== 'undefined';
	});

	const client = new QueryClient();
</script>

{#if !isChrome}
	<div
		class="bg-red-700 text-white p-4 font-bold fixed top-0 inset-x-0 text-2xl"
	>
		<p class="text-center">
			This probably only works on Chrome-based browsers because the others are
			cringe when it comes to audio.
		</p>
	</div>
{/if}
<QueryClientProvider {client}>
	{#if $myId}
		<slot />
	{:else}
		<Login token={data.token} />
	{/if}
</QueryClientProvider>
