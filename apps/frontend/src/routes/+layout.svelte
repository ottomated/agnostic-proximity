<script lang="ts">
	import '../app.css';
	import Login from '$lib/Login.svelte';
	import { myId } from '$lib/socket';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	export let data;

	const client = new QueryClient();
</script>

<QueryClientProvider {client}>
	{#if $myId}
		<slot />
	{:else}
		<Login token={data.token} />
	{/if}
</QueryClientProvider>
