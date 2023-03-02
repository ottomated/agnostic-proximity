module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	extends: ['eslint:recommended', 'plugin:prettier/recommended'],
	plugins: ['svelte3', '@typescript-eslint'],
	overrides: [
		{
			files: ['*.svelte'],
			processor: 'svelte3/svelte3',
		},
		{
			files: ['*.ts'],
			extends: ['plugin:@typescript-eslint/recommended'],
		},
	],
	settings: {
		'svelte3/typescript': () => require('typescript'),
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
	},
};
