import { type INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import {
	DocumentBuilder,
	type SwaggerCustomOptions,
	SwaggerModule,
} from '@nestjs/swagger';
import { env } from '#config';
import { seedDatabase } from '#db';
import { AjvValidationPipe, registerDtoOpenApiSchemas } from '#libs/ajv';
import { json } from 'body-parser';
import type { Server } from 'node:http';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from './app.module.ts';
import {
	ApiKeyGuard,
	SECURITY_API_SCHEMA,
} from './decorators/api-key.guard.ts';

/**
 * Swagger base configuration.
 *
 * @description
 * This function sets up Swagger documentation for the NestJS application.
 * It configures the Swagger module with API metadata, security schemes, and custom options.
 * The Swagger documentation will be available at the specified prefix.
 *
 * @param app - NestJS application instance
 * @param prefix - base prefix for Swagger documentation
 */
export const addSwagger = (app: INestApplication, prefix: string) => {
	const config = new DocumentBuilder()
		.setTitle(env.APP.NAME)
		.setVersion(env.APP.VERSION)
		.addApiKey(SECURITY_API_SCHEMA, ApiKeyGuard.name)
		.addBearerAuth(
			{
				bearerFormat: 'JWT',
				scheme: 'bearer',
				type: 'http',
				description:
					'JWT Access Token. Use the "Authorization" header with the value `Bearer <token>`.',
			},
			'Authorization',
		)
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
 * Starts the application.
 *
 * @description
 * This function initializes the NestJS application with Fastify as the HTTP adapter,
 * sets up global pipes for validation, configures CORS, and optionally sets up Swagger documentation.
 * It returns an object containing the adapter, app instance, and a dispose function to clean up resources.
 * @param port - HTTP server port
 * @param prefix - base prefix
 * @param swagger - if swagger is enabled
 */
export const start = async ({ port = 0, prefix, swagger }: AppStartConfig) => {
	const logger = new Logger('Bootstrap');
	const adapter = new FastifyAdapter();
	const app = await NestFactory.create(AppModule, adapter, {
		cors: {
			origin: env.APP.ALLOWED_ORIGINS,
		},
	});
	app.enableVersioning();
	app.setGlobalPrefix(prefix);
	app.useGlobalPipes(
		new AjvValidationPipe({
			options: {
				coerceTypes: true,
				removeAdditional: true,
				useDefaults: true,
			},
		}),
	);
	app.use(json({ limit: env.APP.REQUEST_TIMEOUT }));

	if (swagger) addSwagger(app, prefix);

	await app.listen(port, '0.0.0.0');
	logger.log(`Application is running on: ${await app.getUrl()}/${prefix}`);

	await seedDatabase();
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
