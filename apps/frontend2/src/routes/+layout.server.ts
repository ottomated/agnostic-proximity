import type { LayoutServerLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		token: locals.token,
	};
};
