import {
	ArgumentMetadata,
	BadRequestException,
	HttpStatus,
	Inject,
	Injectable,
	PipeTransform,
	Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { env } from '#config';
import Ajv, { type Options as AjvOptions } from 'ajv';
import addFormats, {
	type FormatOptions as AjvFormatsOptions,
	FormatName,
} from 'ajv-formats';
import localize from 'ajv-i18n';
import { type FastifyRequest } from 'fastify';

@Injectable({ scope: Scope.REQUEST })
export class AjvValidationPipe implements PipeTransform {
	/**
	 * Validates incoming data against a schema defined in the DTO class.
	 *
	 * This pipe uses AJV to validate the data and localizes error messages to Spanish.
	 * If validation fails, it throws a BadRequestException with formatted error messages.
	 *
	 * @param value The data to validate
	 * @param metadata Metadata about the argument being transformed
	 * @returns The validated value if successful
	 * @throws BadRequestException if validation fails
	 */
	public transform(value: any, metadata: ArgumentMetadata) {
		const { metatype } = metadata;

		// if there is no metatype or it's a primitive type, skip validation.
		// Also, check if the metatype has our static 'schema' property.
		if (!metatype || !('schema' in metatype)) {
			return value;
		}

		// retrieve the schema from the static property of the DTO class
		const schema = (metatype as any).schema;

		const ajv = new Ajv(this.options);
		addFormats(ajv, this.ajvFormatsOptions)
			.addKeyword('kind')
			.addKeyword('modifier');

		const validate = ajv.compile(schema);

		if (validate(value)) {
			return value;
		}

		// localize errors for user-friendly messages
		// Get the 'accept-language' header from the request
		const lang: any =
			this.request?.headers['accept-language']
				?.split(',')[0]
				.trim()
				.toLowerCase() || env.APP.DEFAULT_LOCALE;
		// check if the language is supported, default to 'en' if not
		const locale: ajvI18nLanguages =
			lang && env.APP.SUPPORTED_LANGS.includes(lang) ? lang : 'en';

		// localize the error messages using the localize function
		localize[locale](validate.errors);

		// throw a BadRequestException with the formatted error messages
		throw new BadRequestException({
			message: 'Validation failed',
			errors:
				validate.errors?.map((err) => ({
					field: err.instancePath.replace(/^\//u, ''),
					message: err.message,
				})) || [],
		});
	}

	/**
	 * Creates an instance of AjvValidationPipe.
	 *
	 * @param request The Fastify request object, injected for context
	 * @param pipeOpts Optional configuration for AJV formats and options
	 */
	constructor(pipeOpts?: {
		formats?: AjvFormatsOptions | FormatName[];
		options?: AjvOptions;
	}) {
		const { formats, options } = pipeOpts || {};
		if (options) {
			this.options = options;
		}
		if (formats) {
			const defaultAjvFormatsOptions: AjvFormatsOptions = {
				keywords: true,
				mode: 'fast',
				formats: [
					'date',
					'time',
					'date-time',
					'iso-time',
					'iso-date-time',
					'uri',
					'uri-reference',
					'email',
				],
			};

			this.ajvFormatsOptions = Array.isArray(formats)
				? {
						...defaultAjvFormatsOptions,
						formats,
					}
				: {
						...defaultAjvFormatsOptions,
						...formats,
					};
		}
	}
	@Inject(REQUEST) private readonly request: FastifyRequest;

	/**
	 * Options for AJV formats.
	 *
	 * @description
	 * This property holds the configuration for AJV formats, which can include custom formats or predefined ones.
	 * The default value include:
	 * - formats: `date`, `time`, `date-time`, `iso-time`, `iso-date-time`, `uri`, `uri-reference`, and `email`.
	 * - keywords: `true` to enable AJV keywords.
	 * - mode: `fast` for performance optimization.
	 *
	 * Note: `fast` mode the default formats are simplified. For example, "date", "time" and "date-time"
	 * do not validate ranges in "fast" mode, only string structure, and other formats have simplified regular expressions.
	 * It means if you need strict validation for these formats, you should set `mode: 'full'`.
	 *
	 * @see {@link AjvFormatsOptions} for more details on available options.
	 * @see {@link FormatName} for predefined format names.
	 * @see {@link addFormats} for adding formats to AJV.
	 */
	private ajvFormatsOptions: AjvFormatsOptions;
	/**
	 * Options for AJV validation.
	 *
	 * @description
	 * This property holds the configuration for AJV validation, such as coercing types, removing additional properties,
	 * and using default values.
	 * It can be customized to suit the validation needs of the application.
	 * @see {@link AjvOptions} for more details on available options.
	 * @see {@link Ajv} for the main AJV validation library.
	 */
	private options: AjvOptions;
}
