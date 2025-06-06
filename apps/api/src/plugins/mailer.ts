import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Resend } from "resend";
import path from "path";
import fs from "fs/promises";
import handlebars from "handlebars";

type TemplateParams = Record<string, any>;

interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    params: TemplateParams;
}

export interface Mailer {
    sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}

const renderTemplate = async (templateName: string, params: TemplateParams): Promise<string> => {
    const filePath = path.join(__dirname, "..", "templates", `${templateName}.hbs`);
    const source = await fs.readFile(filePath, "utf8");
    const compiled = handlebars.compile(source);
    return compiled(params);
};

const mailerPlugin: FastifyPluginAsync = async (app) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const isDev = process.env.NODE_ENV !== "production";

    async function sendEmail({ to, subject, templateName, params }: SendEmailOptions) {
        const html = await renderTemplate(templateName, params);

        if (isDev) {
            app.log.info(`[DEV] Email para: ${to}`);
            app.log.info(`Assunto: ${subject}`);
            app.log.info(`HTML: ${html}`);
            return;
        }

        await resend.emails.send({
            from: 'SuaApp <onboarding@resend.dev>',
            to,
            subject,
            html
        });
    }

    const mailer: Mailer = {
        async sendPasswordResetEmail(to, resetLink) {
            return sendEmail({
                to,
                subject: "Redefinição de senha",
                templateName: "password-reset",
                params: { resetLink }
            });
        }
    };

    app.decorate("mailer", mailer);
};

export default fp(mailerPlugin, {
    name: "mailer",
});
