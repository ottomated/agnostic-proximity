export const load = async ({ locals }) => {
	return {
		token: locals.token,
	};
};

export const prerender = false;
export const csr = false;
export const ssr = true;
