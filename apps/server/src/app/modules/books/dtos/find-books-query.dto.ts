import { Type } from '@sinclair/typebox';

import { AjvDto } from '#libs/ajv';
import { pageOptionsSchema } from '../../../common/schemas';

export class FindBooksQueryDto extends AjvDto({
	includeDeleted: Type.Optional(
		Type.Boolean({
			description: 'Include soft-deleted books in the results',
			example: false,
		}),
	),
	search: Type.Optional(
		Type.String({
			example: 'Harry Potter',
			description:
				'Search term to filter books by title, author, publisher, or ISBN',
		}),
	),
	...pageOptionsSchema('title'),
}) {}

// register DTO OpenApi schema to Swagger
FindBooksQueryDto.registerOpenApi();
