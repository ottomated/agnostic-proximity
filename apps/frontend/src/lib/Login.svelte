<script lang="ts">
	import { dev } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { createQuery } from '@tanstack/svelte-query';
	import { myId } from './socket';

	export let token: string;

	const protocol = dev ? 'http' : 'https';

	const users = createQuery({
		queryKey: ['users'],
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
	class="bg-slate-900 text-red-100 h-screen flex flex-col items-center justify-center gap-2"
>
	{#if $users.isLoading}
		<p>Loading...</p>
	{:else if $users.isError}
		<p>Error: {$users.error}</p>
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
