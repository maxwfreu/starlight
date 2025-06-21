import { defineMiddleware } from 'astro:middleware';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const layersCSS = readFileSync(join(__dirname, 'style/layers.css'), 'utf-8').trim();

/**
 * Middleware to inject Starlight CSS layer declarations into the `<head>` of HTML responses.
 * This is used to ensure that the layers are always in the correct order.
 * Issue: https://github.com/withastro/starlight/issues/3162
 */
export const onRequest = defineMiddleware(async (request, next) => {
  const response = await next();

  if (response.headers.get('content-type')?.includes('text/html')) {
    const body = await response.text();
    const modifiedBody = body.replace(
      '<head>',
      `<head><style>${layersCSS}</style>`
    );
    return new Response(modifiedBody, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    });
  }
  return response;
});