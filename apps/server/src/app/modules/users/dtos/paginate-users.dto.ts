import { Type } from '@sinclair/typebox';
import { AjvDto } from '#libs/ajv';
import { pageOptionsSchema } from '../../../common/schemas';

export class PaginateUsersDto extends AjvDto({
	includeDeleted: Type.Optional(
		Type.Boolean({
			description: 'Include soft-deleted users in the results',
			example: false,
		}),
	),
	search: Type.Optional(
		Type.String({
			example: 'John Doe',
			description:
				'Search term to filter users by email, first name, last name',
		}),
	),
	...pageOptionsSchema('email'),
}) {}

// register DTO OpenApi schema to Swagger
PaginateUsersDto.registerOpenApi();
