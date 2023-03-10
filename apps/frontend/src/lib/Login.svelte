<script lang="ts">
	import { PUBLIC_BACKEND_HOST } from '$env/static/public';
	import { createQuery } from '@tanstack/svelte-query';
	import { myId } from './socket';

	const users = createQuery({
		queryKey: ['users'],
		queryFn: () =>
			fetch(`${PUBLIC_BACKEND_HOST}/users`).then(
				(res) => res.json() as Promise<{ id: string; name: string }[]>
			),
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
