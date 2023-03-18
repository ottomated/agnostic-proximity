<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<main
	class="bg-slate-900 gap-4 overflow-auto text-white w-full h-screen flex flex-col p-8 items-center"
>
	<h1 class="text-3xl font-bold">Rules</h1>
	<ul class="text-lg text-left list-disc max-w-3xl">
		<li>Do not pick Gekko</li>
		<li>
			Try your best not to stack on top of each other - the person on bottom
			will fade out and you won't be able to hear them
			<img class="w-64" src="/stack.png" alt="Stacking" />
		</li>
		<li class="text-xl">Expect jankiness :)</li>
	</ul>

	<h1 class="text-3xl font-bold">Setup Instructions</h1>
	<div class="max-w-4xl flex flex-col gap-4">
		<p class="text-xl">1. Turn off in-game UI</p>
		<img class="w-full px-16" src="/ui.png" alt="Hide User Interface In Game" />
		<p class="text-xl">2. Unbind the scoreboard button</p>
		<img class="w-full px-16" src="/scoreboard.png" alt="Unbind Scoreboard" />
		<p class="text-xl">3. Turn off in-game voice chat</p>
		<img class="w-full px-16" src="/voice.png" alt="Turn Off Voice Chat" />
		<p class="text-xl">
			4. <a
				class="text-blue-400 underline"
				href="/?token={data.token}"
				target="_blank">Open the website</a
			>
			on a Chrome-based browser
		</p>
	</div>
</main>
