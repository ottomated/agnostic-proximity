import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		preprocess({
			postcss: true,
			replace: [
				[
					/import\s*{\s*([^}]+?)\s*,?\s*}\s*from\s+['"]lucide-svelte['"](\s*;)?/gim,
					(_, /**@type {string} */ imports) => {
						return imports
							.split(/\s*,\s*/gim)
							.map((s) => {
								let icon = s.split(/\s+as\s+/);
								let name = icon[1] || icon[0];
								let file = icon[0]
									.replace(/[A-Z]/g, (s) => '-' + s.toLowerCase())
									.slice(1);
								return `import ${name} from 'lucide-svelte/dist/esm/icons/${file}.svelte';`;
							})
							.join('');
					},
				],
			],
		}),
	],

	kit: {
		adapter: adapter(),
	},
};

export default config;
