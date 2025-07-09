/* eslint-disable perfectionist/sort-objects */
import { BadRequestException } from '@nestjs/common';
import { type OpenAPIObject } from '@nestjs/swagger';
import { Type } from '@sinclair/typebox';
import { describe, expect, test, vi } from 'vitest';
import {
	AjvDto,
	AjvIterableDto,
	registerDtoOpenApiSchemas,
} from './ajv.dto.ts';
import { AjvValidationPipe } from './ajv.pipe.ts';

describe(AjvValidationPipe, () => {
	// tests
	test('register DTO schemas', () => {
		const openApi = {} as OpenAPIObject;

		class Dto extends AjvDto({ id: Type.Number() }) {}
		Dto.registerOpenApi();
		registerDtoOpenApiSchemas(openApi);

		const { components } = openApi;

		expect(components).toBeDefined();
		expect(components?.schemas?.[Dto.name]).toBeDefined();
	});

	test('DTO generates JSON schema', () => {
		Date.now = vi
			.fn()
			.mockReturnValue(new Date('2025-01-01T00:00:00.000Z').getTime());
		const dto = AjvDto({
			// primitive values
			string: Type.String(),
			number: Type.Number(),
			boolean: Type.Boolean(),
			// empty types
			undefined: Type.Undefined(),
			null: Type.Null(),
			void: Type.Void(),
			// allows any value
			any: Type.Any(),
			unknown: Type.Unknown(),
			// allows no values
			never: Type.Never(),
			// coercion - TypeBox doesn't have direct coercion, these are just typed as their target types
			coerceDate: Type.Date(),
			coerceToString: Type.String(),
			coerceToBool: Type.Boolean(),
			// literal
			tuna: Type.Literal('tuna'),
			twelve: Type.Literal(12),
			tru: Type.Literal(true),
			// strings
			max: Type.String({ maxLength: 3 }),
			min: Type.String({ minLength: 10 }),
			length: Type.String({ minLength: 5, maxLength: 5 }),
			email: Type.String({ format: 'email' }),
			url: Type.String({ format: 'uri' }),
			emoji: Type.String({ pattern: String.raw`^[\p{Emoji}]+$` }),
			uuid: Type.String({ format: 'uuid' }),
			cuid: Type.String({ pattern: '^c[a-z0-9]{24}$' }),
			cuid2: Type.String({ pattern: '^[a-z][a-z0-9]{7,31}$' }),
			ulid: Type.String({ pattern: '^[0-9A-HJKMNP-TV-Z]{26}$' }),
			regex: Type.String({ pattern: '[a-c]' }),
			includes: Type.String({ pattern: '.*hello.*' }),
			startsWith: Type.String({ pattern: '^a.*' }),
			endsWith: Type.String({ pattern: '.*z$' }),
			ipv4: Type.String({ format: 'ipv4' }),
			ipv6: Type.String({ format: 'ipv6' }),
			multiple: Type.String({
				format: 'email',
				maxLength: 12,
				default: 'test@test.cl',
			}),
			// numbers
			gt: Type.Number({ exclusiveMinimum: 5 }),
			gte: Type.Number({ minimum: 5 }),
			lt: Type.Number({ exclusiveMaximum: 5 }),
			lte: Type.Number({ maximum: 5 }),
			int: Type.Integer(),
			positive: Type.Number({ minimum: 0, exclusiveMinimum: 0 }),
			nonnegative: Type.Number({ minimum: 0 }),
			negative: Type.Number({ maximum: 0, exclusiveMaximum: 0 }),
			nonpositive: Type.Number({ maximum: 0 }),
			multipleOf: Type.Number({ multipleOf: 5 }),
			// nan - TypeBox doesn't have direct NaN support, using a custom type
			nan: Type.Number({ const: Number.NaN }),
			// dates
			datetime: Type.String({ format: 'date-time' }),
			from: Type.Date({ minimum: new Date('1900-01-01').getTime() }),
			until: Type.Date({ maximum: Date.now() }),
			// enum
			enum: Type.Union([
				Type.Literal('Salmon'),
				Type.Literal('Tuna'),
				Type.Literal('Trout'),
			]),
			// default
			default: Type.String({ default: 'hello world' }),
			// nullable, optionals
			optional: Type.Optional(Type.Boolean()),
			nullable: Type.Union([Type.Boolean(), Type.Null()]),
			nullish: Type.Union([
				Type.Boolean(),
				Type.Null(),
				Type.Undefined(),
			]),
			// objects
			object: Type.Object({
				id: Type.Number({ minimum: 0, exclusiveMinimum: 0 }),
				name: Type.String(),
			}),
			// arrays
			array: Type.Array(Type.Number()),
			arrayNonEmpty: Type.Array(Type.Number(), { minItems: 1 }),
			arrayOf5: Type.Array(Type.Number(), { minItems: 5, maxItems: 5 }),
			arrayFrom5: Type.Array(Type.Number(), { minItems: 5 }),
			// tuples
			tuple: Type.Tuple([Type.String(), Type.Boolean()]),
			// union
			stringOrNumber: Type.Union([Type.String(), Type.Number()]),
			numberOrBool: Type.Union([Type.Number(), Type.Boolean()]),
			discriminated: Type.Union([
				Type.Object({
					status: Type.Literal('success'),
					data: Type.String(),
				}),
				Type.Object({
					status: Type.Literal('failed'),
					message: Type.String(),
				}),
			]),
			// records
			record: Type.Record(Type.String(), Type.Number()),
			lookup: Type.Record(Type.String({ maxLength: 3 }), Type.Boolean()),
			// intersection
			intersection: Type.Intersect([
				Type.Object({
					name: Type.String(),
				}),
				Type.Object({
					role: Type.String(),
				}),
			]),
		});

		expect(dto.schema).toBeDefined();
		// clear snapshot

		expect(dto.schema).toMatchSnapshot();
	});

	test('object DTO parses values on instantiation', () => {
		class Dto extends AjvDto({ id: Type.Number() }) {}

		const dto = new Dto();

		expect(dto).toBeDefined();
	});

	test('iterable (array) DTO parses values on instantiation', () => {
		class DtoIterable extends AjvIterableDto([Type.Number()]) {}

		const dto = new DtoIterable([1]);

		expect(dto[0]).toBe(1);
	});

	test('iterable (tuple) DTO parses values on instantiation', () => {
		class DtoIterable extends AjvIterableDto([
			Type.Number(),
			Type.Boolean(),
		]) {}
		const dto = new DtoIterable([1, true]);

		expect(dto[0]).toBe(1);
		expect(dto[1]).toBe(true);
		expect(dto).toBeDefined();
	});

	describe('validation pipe', () => {
		const _pipe = new AjvValidationPipe();
		const _dto = AjvDto({
			number: Type.Number(),
			string: Type.String(),
		});
		const metadata = { metatype: _dto } as any;

		test('parses correct input', () => {
			const input = { number: 1, string: 'str' };

			const result = _pipe.transform(input, metadata);

			expect(result).toStrictEqual(input);
		});

		test('throws BadRequestException on bad input', () => {
			const input = { id: 1 };

			expect(() => _pipe.transform(input, metadata)).toThrow(
				BadRequestException,
			);
		});

		test('when metatype is not AjvDTO input is bypassed', () => {
			const input = { id: 1 };

			const result = _pipe.transform(input, { metatype: {} } as any);

			expect(result).toStrictEqual(input);
		});
	});
});
