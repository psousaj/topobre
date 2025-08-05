import fp from 'fastify-plugin';
import fastifyView from '@fastify/view';
import handlebars from 'handlebars';
import path from 'path';
import { previewQuerySchema } from '../shared/schemas';
import { z } from 'zod';
import { FastifyZodApp } from 'src/types';

handlebars.registerHelper('year', () => new Date().getFullYear());

export default fp(async (app: FastifyZodApp, opts: { devMode?: boolean; prefix?: string }) => {
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
        const parsed = req.query;

        const { t: template, ...data } = parsed;

        if (typeof template !== 'string') {
            return reply.code(400).send('Invalid template name');
        }

        return reply.view(template, data);
    });
});
