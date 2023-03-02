<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import Login from '$lib/Login.svelte';
	import { myId } from '$lib/socket';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	const client = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
			},
		},
	});
</script>

<QueryClientProvider {client}>
	{#if $myId}
		<slot />
	{:else}
		<Login />
	{/if}
</QueryClientProvider>
