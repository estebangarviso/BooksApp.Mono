import { type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import {
	DocumentBuilder,
	type SwaggerCustomOptions,
	SwaggerModule,
} from '@nestjs/swagger';
import { env } from '#config';
import { AjvValidationPipe, registerDtoOpenApiSchemas } from '#libs/ajv';
import { json } from 'body-parser';
import type { Server } from 'node:http';
import { AppModule } from './app.module.ts';
import {
	ApiKeyGuard,
	SECURITY_API_SCHEMA,
} from './decorators/api-key.guard.ts';

/**
 * Swagger base configuration.
 *
 * @param app - app bootstrap
 */
export const addSwagger = (app: INestApplication, prefix: string) => {
	const config = new DocumentBuilder()
		.setTitle(env.APP.NAME)
		.setVersion(env.APP.VERSION)
		.addApiKey(SECURITY_API_SCHEMA, ApiKeyGuard.name)
		.build();

	const document = SwaggerModule.createDocument(app, config);

	// register ajv DTOs
	registerDtoOpenApiSchemas(document);

	SwaggerModule.setup(prefix, app, document, {
		customSiteTitle: process.env.TITLE,
		jsonDocumentUrl: `${prefix}/openapi.json`,
		swaggerOptions: {
			displayRequestDuration: true,
			persistAuthorization: true,
			tryItOutEnabled: true,
		},
	} satisfies SwaggerCustomOptions);
};

/**
 * App initializing.
 *
 * @param port - HTTP server port
 * @param prefix - base prefix
 * @param swagger - if swagger is enabled
 */
export const start = async ({ port = 0, prefix, swagger }: AppStartConfig) => {
	const adapter = new FastifyAdapter();
	const app = await NestFactory.create(AppModule, adapter, {
		cors: true,
	});

	app.enableVersioning();
	app.setGlobalPrefix(prefix);
	app.useGlobalPipes(new AjvValidationPipe());
	app.use(json({ limit: env.APP.REQUEST_TIMEOUT }));

	if (swagger) addSwagger(app, prefix);

	await app.listen(port, '0.0.0.0');

	const dispose = async () => {
		const server = app.getHttpServer() as Server;
		server.closeAllConnections();
		await app.close();
	};

	return { adapter, app, dispose };
};

export interface AppStartConfig {
	prefix: string;
	port?: number;
	swagger?: boolean;
}
