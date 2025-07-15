import { RuntimeException } from '@nestjs/core/errors/exceptions';
import {
	type OpenAPIObject,
	type ReferenceObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.ts';
import {
	type ArrayOptions,
	type ObjectOptions,
	type Static,
	type StaticDecode,
	type TAny,
	type TArray,
	type TProperties,
	type TSchema,
	type TTuple,
	Type,
} from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import type { SchemaOptions } from 'type-fest';

type InferTuple<Tuple extends [...TSchema[]]> = {
	[Index in keyof Tuple]: Static<Tuple[Index]>;
};
type InferArray<Arr extends [...TSchema[]]> = Static<Arr[0]>[];

const registeredDtoOpenApiSchemas: [name: string, schema: object][] = [];

/**
 * Returns a reference object for OpenApi Swagger.
 *
 * @param name - name of the schema
 * @returns ReferenceObject
 */
function getRefObj(name: string): ReferenceObject {
	return {
		$ref: `#/components/schemas/${name}`,
	};
}

/**
 * Parses the input using `Value.Parse` from TypeBox,
 * or directly using the schema's `parse` method if available.
 *
 * @param schema - TypeBox schema to parse the input
 * @param input - Input to be parsed
 * @returns Parsed input as per the schema
 * @throws {ParseError} If the schema does not have a parse method
 */
function schemaInputParser<T extends TSchema>(
	schema: T,
	input: unknown,
): StaticDecode<T> {
	return Value.Parse<T, StaticDecode<T>>(schema, input);
}

/**
 * Ajv DTO decorator for OpenApi Swagger.
 *
 * @example
 * ```ts
 * // sample.dto.ts
 *	import { AjvDto } from '#libs/ajv';
 *	import { Type } from '@sinclair/typebox';
 *
 *	export class SampleDto extends AjvDto({
 *		id: Type.Number(),
 *		isActive: Type.Boolean(),
 *		name: Type.String(),
 *	}) {}
 *
 *	// register DTO OpenApi schema to Swagger
 *	SampleDto.registerOpenApi();
 *	// sample.controller.ts
 *	import { SampleDto } from './sample.dto.ts';
 *
 *	\@Controller('sample')
 *	export class SampleController {
 *		\@Post()
 *		\@ApiBody({ schema: SampleDto.schema })
 *		sample(\@Body() demo: SampleDto): any { ... }
 *	}
 *
 *	// sample.parser.ts
 *	import { SampleDto } from './sample.dto.ts';
 *
 *	export const parseSampleDto = (input: unknown) => {
 *		return SampleDto.parseSchema(input);
 *	}
 * ```
 */
export const AjvDto = <P extends TProperties = TProperties>(
	properties: P,
	config?: ObjectOptions,
) => {
	return class {
		static schema = Type.Object(properties, config);

		static get refObj(): ReferenceObject {
			return getRefObj(this.name);
		}

		static parseSchema(input: unknown): StaticDecode<typeof this.schema> {
			return schemaInputParser(this.schema, input);
		}

		static registerOpenApi(): void {
			const name = this.name;
			if (registeredDtoOpenApiSchemas.some(([n]) => n === name)) {
				// when schema is already registered, throw an error
				throw new RuntimeException(
					`OpenApi schema for DTO "${name}" is already registered.`,
				);
			}

			registeredDtoOpenApiSchemas.push([name, this.schema]);
		}
	};
};

/**
 * Creates a DTO from ajv array or tuple,
 * with schema
 * static properties.
 *
 * @param items - ajv types list
 * @param config - ajv type config
 *
 * @example
 * ```ts
 *	// sample.dto.ts
 *	import { Type } from '@sinclair/typebox';
 *	import { AjvIterableDto } from '#libs/ajv';
 *
 *	export class SampleDtoIterable extends AjvIterableDto([
 *		Type.Number(),
 *		Type.String(),
 *	]) {}
 *
 *	SampleDtoIterable.registerOpenApi();
 *
 *	// sample.controller.ts
 *	import { SampleDtoIterable } from './sample.dto.ts';
 *
 *	\@Controller('sample')
 *	export class SampleController {
 *		\@Post()
 *		\@ApiBody({ schema: SampleDtoIterable.schema })
 *		sample(\@Body() demo: SampleDtoIterable): any { ... }
 *	}
 *
 *	// sample.parser.ts
 *	import { SampleDtoIterable } from './sample.dto.ts';
 *
 *	export const parseSampleDtoIterable = (input: unknown) => {
 *		return SampleDtoIterable.parseSchema(input);
 *	}
 * ```
 */
export const AjvIterableDto = <
	T extends [TSchema, ...TSchema[]],
	S extends TArray<TAny> | TTuple<T> = T['length'] extends 1
		? TArray<TAny>
		: TTuple<T>,
	I = T['length'] extends 1 ? InferArray<T> : InferTuple<T>,
>(
	items: T,
	config?: T['length'] extends 1 ? ArrayOptions : SchemaOptions,
): AjvIterableDto<S, I> => {
	const schema = (
		items.length === 1
			? Type.Array(items[0], config)
			: Type.Tuple(items, config)
	) as S;
	return class extends Array {
		static schema: S = schema;

		static get refObj(): ReferenceObject {
			return getRefObj(this.name);
		}

		static parseSchema(input: unknown): StaticDecode<typeof this.schema> {
			return schemaInputParser(schema, input);
		}

		static registerOpenApi(): void {
			const name = this.name;
			if (registeredDtoOpenApiSchemas.some(([n]) => n === name)) {
				// when schema is already registered, throw an error
				throw new RuntimeException(
					`OpenApi schema for iterable DTO "${name}" is already registered.`,
				);
			}

			registeredDtoOpenApiSchemas.push([name, this.schema]);
		}

		constructor(items: I | unknown[] = []) {
			super();
			if (items) {
				this.push(...(schemaInputParser(schema, items) as unknown[]));
			}
		}
	};
};

/**
 * Interface for Ajv DTOs.
 *
 * This interface is used to ensure that the Ajv DTOs
 * have the required static methods and properties.
 */
export interface AjvDto<S extends TSchema = TSchema> {
	/**
	 * ReferenceObject for the DTO schema.
	 * This is a static property that provides a reference
	 * to the schema in the OpenApi document.
	 */
	readonly refObj: ReferenceObject;
	/**
	 * TypeBox schema for the DTO.
	 * This is a static property that holds the schema definition.
	 */
	readonly schema: S;

	/**
	 * Parses the input using the DTO schema.
	 * Uses TypeBox's Value.Parse or schema's parse method.
	 *
	 * @param input - Input to be parsed
	 * @returns Parsed input as per the schema
	 * @throws {AssertError} If the schema does not have a parse method
	 */
	readonly parseSchema: (input: unknown) => StaticDecode<S>;
	/**
	 * Registers the DTO schema to OpenApi Swagger document.
	 */
	registerOpenApi(): void;
}

/**
 * Interface for Ajv Iterable DTOs.
 *
 * This interface extends AjvDto and adds the ability to
 * create an iterable DTO from an array or tuple of types.
 */
export interface AjvIterableDto<
	A extends TSchema = TSchema,
	I = InferArray<any> | InferTuple<any>,
	T = I extends (infer A)[] ? A : I extends [...infer B] ? B : any[],
> extends AjvDto<A> {
	new (items?: I | unknown[]): T[];
}

/**
 * Register Ajv DTOs schemas to
 * OpenApi Swagger document.
 *
 * @example
 * ```ts
 *	import { ... } from '...';
 *	import { registerDtoSchemas } from '#libs/ajv';
 *
 *	const app = await NestFactory.create(AppModule);
 *
 *	const config = new DocumentBuilder().build();
 *	const document = SwaggerModule.createDocument(app, config);
 *
 *	registerDtoSchemas(document);
 * ```
 */
export const registerDtoOpenApiSchemas = (
	openApi: OpenAPIObject,
): OpenAPIObject => {
	openApi.components ??= {};
	openApi.components.schemas ??= {};

	for (const [name, schema] of registeredDtoOpenApiSchemas) {
		openApi.components.schemas[name] = schema;
	}

	return openApi;
};
