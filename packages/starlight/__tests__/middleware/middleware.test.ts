import type { APIContext } from 'astro';
import { expect, test } from 'vitest';
import { onRequest } from '../../locals';
import { onRequest as onLayerRequest } from '../../layers';

test('starlightRoute throws when accessed outside of a Starlight page', async () => {
	const context = { locals: {}, currentLocale: 'en' } as APIContext;
	await onRequest(context, async () => new Response());
	expect(() => {
		context.locals.starlightRoute;
	}).toThrowErrorMatchingInlineSnapshot(`
		"[AstroUserError]:
			\`locals.starlightRoute\` is not defined
		Hint:
			This usually means a component that accesses \`locals.starlightRoute\` is being rendered outside of a Starlight page, which is not supported.
			
			If this is a component you authored, you can do one of the following:
			
			1. Avoid using this component in non-Starlight pages.
			2. Wrap the code that reads \`locals.starlightRoute\` in a  \`try/catch\` block and handle the cases where \`starlightRoute\` is not available.
			
			If this is a Starlight built-in or third-party component, you may need to report a bug or avoid this use of the component."
	`);
});

test('starlightRoute returns as expected if it has been set', async () => {
	const context = { locals: {}, currentLocale: 'en' } as APIContext;
	await onRequest(context, async () => new Response());
	context.locals.starlightRoute = { siteTitle: 'Test title' } as any;
	expect(context.locals.starlightRoute.siteTitle).toBe('Test title');
});

test('CSS layers are correctly injected into the head', async () => {
	const context = { locals: {}, currentLocale: 'en' } as APIContext;
	const response = await onLayerRequest(context, async () => new Response('<html><head></head><body></body></html>', {
		headers: {
			'content-type': 'text/html',
		},
	}));
	const body = await response.text();
	expect(body).toEqual('<html><head><style>@layer starlight.base, starlight.reset, starlight.core, starlight.content, starlight.components, starlight.utils;</style></head><body></body></html>');
	expect(response.headers.get('content-type')).toBe('text/html');
});

test('CSS layers are not injected into non-HTML responses', async () => {
	const context = { locals: {}, currentLocale: 'en' } as APIContext;
	const response = await onLayerRequest(context, async () => new Response('Not HTML', {
		headers: {
			'content-type': 'text/plain',
		},
	}));
	const body = await response.text();
	expect(body).toBe('Not HTML');
	expect(response.headers.get('content-type')).toBe('text/plain');
});