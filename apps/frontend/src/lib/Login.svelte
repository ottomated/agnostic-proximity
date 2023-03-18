<script lang="ts">
	import { dev } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { createQuery } from '@tanstack/svelte-query';
	import { myId } from './socket';

	export let token: string;

	const protocol = dev ? 'http' : 'https';

	const users = createQuery({
		queryKey: ['users'],
		refetchInterval: 1000,
		queryFn: async () => {
			const res = await fetch(
				`${protocol}://${env.PUBLIC_BACKEND_HOST}:${env.PUBLIC_BACKEND_PORT}/users`,
				{
					headers: {
						Authorization: token,
					},
				}
			);
			if (!res.ok) {
				throw new Error(await res.text());
			}
			return res.json() as Promise<{ id: string; name: string }[]>;
		},
	});
</script>

<main
	class="bg-slate-900 text-xl text-slate-200 h-screen flex flex-col items-center justify-center gap-2"
>
	{#if $users.isLoading}
		<p class="italic">Loading users...</p>
	{:else if $users.isError}
		<p class="text-red-100">Error: {$users.error}</p>
	{:else if $users.data.length === 0}
		<p class="italic">Waiting for game to start...</p>
	{:else}
		<p>Who are you?</p>
		{#each $users.data as user}
			<button
				on:click={() => ($myId = user.id)}
				class="bg-slate-500 text-white p-2 rounded"
			>
				{user.name}
			</button>
		{/each}
	{/if}
</main>
