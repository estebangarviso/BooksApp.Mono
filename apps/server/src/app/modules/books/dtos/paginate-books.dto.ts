import { Type } from '@sinclair/typebox';

import { AjvDto } from '#libs/ajv';

export class PaginateBooksDto extends AjvDto({
	includeDeleted: Type.Optional(
		Type.Boolean({
			description: 'Include soft-deleted books in the results',
			example: false,
		}),
	),
	limit: Type.Optional(
		Type.Integer({
			description: 'Number of items per page',
			example: 10,
		}),
	),
	page: Type.Optional(
		Type.Integer({
			description: 'Page number for pagination',
			example: 1,
		}),
	),
	search: Type.Optional(
		Type.String({
			example: 'Harry Potter',
			description:
				'Search term to filter books by title, author, publisher, or ISBN',
		}),
	),
	sortBy: Type.Optional(
		Type.String({
			description: 'Field to sort by',
			example: 'title',
		}),
	),
	sortOrder: Type.Optional(
		Type.String({
			description: 'Order of sorting (asc or desc)',
			example: 'asc',
		}),
	),
}) {}

// register DTO OpenApi schema to Swagger
PaginateBooksDto.registerOpenApi();
