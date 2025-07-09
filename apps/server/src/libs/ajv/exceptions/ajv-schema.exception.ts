import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from 'ajv';

/**
 * Ajv schema validation error.
 */
export class AjvSchemaException extends BadRequestException {
	constructor(error: ValidationError) {
		const errorMessage = error.errors.map(
			(err) => `${err.instancePath}: ${err.message}`,
		);
		super(errorMessage);
	}
}
