import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Resend } from "resend";
import path from "path";
import fs from "fs/promises";
import handlebars from "handlebars";

import { Mailer, SendEmailOptions, TemplateParams } from "../types";
import { env } from "../../../../libs/shared/env";

async function renderTemplate(templateName: string, params: TemplateParams): Promise<string> {
    const filePath = path.join(__dirname, "..", "templates", `${templateName}.hbs`);
    const source = await fs.readFile(filePath, "utf8");
    const compiled = handlebars.compile(source);
    return compiled(params);
}

async function mailerPlugin(app: FastifyInstance): Promise<void> {
    const resend = new Resend(env.RESEND_API_KEY);
    const isDev = process.env.NODE_ENV !== "production";

    async function sendEmail(options: SendEmailOptions): Promise<void> {
        const { to, subject, templateName, params } = options;

        try {
            app.log.info(`📧 Gerando email com template: ${templateName} para ${to}`);
            const html = await renderTemplate(templateName, params);
            const destiny = isDev ? 'delivered@resend.dev' : to

            const result = await resend.emails.send({
                from: 'Topobre App <naoresponda@topobre.crudbox.com.br>',
                to: destiny,
                subject,
                html
            });

            app.log.info(`📨 Email enviado para ${destiny}`);
            app.log.debug(`Resend response: ${JSON.stringify(result, null, 2)}`);

            if (isDev) {
                app.log.info(`[DEV MODE] Email enviado com Resend (modo desenvolvimento ativo)`);
            }

        } catch (err) {
            app.log.error(`❌ Falha ao enviar email para ${to} com template "${templateName}"`);
            app.log.error(err);
            throw err;
        }
    }


    const mailer: Mailer = {
        async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
            app.log.info(`🔐 Enviando email de redefinição de senha para ${to}`);
            return sendEmail({
                to,
                subject: "Redefinição de senha",
                templateName: "password-reset",
                params: { resetLink }
            });
        }
    };

    app.decorate("mailer", mailer);
}

export default fp(mailerPlugin, {
    name: "mailer",
});