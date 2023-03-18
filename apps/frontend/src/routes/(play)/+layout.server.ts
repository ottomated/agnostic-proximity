export const ssr = false;
export const prerender = false;

export const load = async ({ locals }) => {
	return {
		token: locals.token,
	};
};
