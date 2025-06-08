import { FastifyZodApp } from "../types";
import pkg from "../../package.json";
import { env } from "@topobre/env";

export function bootstrapLogger(app: FastifyZodApp) {
    app.log.info(' ');
    app.log.info(' _____    ______     _                  ___              ');
    app.log.info('|_   _|   | ___ \\   | |                / _ \\             ');
    app.log.info('  | | ___ | |_/ /__ | |__  _ __ ___   / /_\\ \\_ __  _ __  ');
    app.log.info('  | |/ _ \\|  __/ _ \\| \'_ \\| \'__/ _ \\  |  _  | \'_ \\| \'_ \\ ');
    app.log.info('  | | (_) | | | (_) | |_) | | |  __/  | | | | |_) | |_) |');
    app.log.info('  \\_/\\___/\\_|  \\___/|_.__/|_|  \\___|  \\_| |_/ .__/| .__/ ');
    app.log.info('                                          | |   | |     ');
    app.log.info('                                          |_|   |_|     ');
    app.log.info(' ');
    app.log.info(`${pkg.name} v${pkg.version} © ${new Date().getFullYear()} Psousaj`);
    app.log.info(`Running in: ${env.NODE_ENV} mode on ${process.platform}`);
    app.log.info(`Server Time: ${new Date().toString()}`);
}