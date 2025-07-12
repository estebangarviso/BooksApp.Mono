import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { env } from '#config';
import { FastifyReply, FastifyRequest } from 'fastify';
import util from 'node:util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	async catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<FastifyReply>();
		const request = ctx.getRequest<FastifyRequest>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const message =
			exception instanceof HttpException
				? exception.getResponse()
				: 'Internal server error';

		const errorResponse = {
			message,
			path: request.url,
			statusCode: status,
			timestamp: new Date().toISOString(),
			trackId: request.id,
		};

		if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
			this.logger.error(
				`HTTP Status: ${status} Error Message: ${util.inspect(message, {
					colors: env.APP.LOG_COLORIZE,
					depth: null,
				})}`,
				exception instanceof Error ? exception.stack : '',
			);
		} else {
			this.logger.warn(
				`HTTP Status: ${status} Error Message: ${util.inspect(message, {
					colors: env.APP.LOG_COLORIZE,
					depth: null,
				})}`,
			);
		}

		await response.status(status).send(errorResponse);
	}
}
