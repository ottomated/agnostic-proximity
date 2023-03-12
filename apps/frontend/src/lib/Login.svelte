<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { createQuery } from '@tanstack/svelte-query';
	import { myId } from './socket';

	export let token: string;

	const users = createQuery({
		queryKey: ['users'],
		queryFn: () =>
			fetch(`https://${env.PUBLIC_BACKEND_HOST}/users`, {
				headers: {
					Authorization: token,
				},
			}).then((res) => res.json() as Promise<{ id: string; name: string }[]>),
	});
</script>

<main
	class="bg-slate-900 text-red-100 h-screen flex flex-col items-center justify-center"
>
	{JSON.stringify($users.data)}
	<button
		on:click={() => ($myId = crypto.randomUUID())}
		class="bg-slate-500 text-white p-2 rounded"
	>
		Login
	</button>
</main>
