import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.url.searchParams.get('token');
	if (!token) return new Response('Missing token');
	if (token !== env.AUTH_TOKEN) return new Response('Invalid token');

	event.locals.token = token;

	return resolve(event);
};
