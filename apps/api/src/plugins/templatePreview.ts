import fp from 'fastify-plugin';
import fastifyView from '@fastify/view';
import handlebars from 'handlebars';
import path from 'path';
import qs from 'qs';
import { previewQuerySchema } from '../shared/schemas';
import { z } from 'zod';


handlebars.registerHelper('year', () => new Date().getFullYear());


export default fp(async (app, opts: { devMode?: boolean; prefix?: string }) => {
    if (!opts.devMode) return;

    await app.register(fastifyView, {
        engine: { handlebars },
        root: path.join(__dirname, '..', 'templates'),
        viewExt: 'hbs',
    });

    const prefix = opts.prefix || '';

    app.get(`${prefix}/preview-template`, {
        schema: {
            tags: ['Preview Templates'],
            description: 'Preview a template with query params',
            querystring: previewQuerySchema,
            response: {
                200: z.string().describe('Rendered HTML of the template'),
            }
        }
    }, async (req, reply) => {
        const query = req.query as Record<string, string>;
        const parsed = qs.parse(new URLSearchParams(query as any).toString());

        const { template, ...data } = parsed;

        if (typeof template !== 'string') {
            return reply.code(400).send('Invalid template name');
        }

        return reply.view(template, data);
    });
});
