import { Type } from '@sinclair/typebox';
import { AjvDto } from '#libs/ajv';

export class UserVo extends AjvDto({
	id: Type.String({
		description: 'Unique identifier of the user',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
	}),
	createdAt: Type.String({
		description: 'Creation date of the user',
		example: '2023-01-01T12:00:00Z',
		format: 'date-time',
	}),
	email: Type.String({
		description: 'Email address of the user',
		example: 'johndoe@example.com',
	}),
	firstName: Type.String({
		description: 'First name of the user',
		example: 'John',
	}),
	hasAccess: Type.Boolean({
		description: 'Indicates if the user has access',
		example: true,
	}),
	lastName: Type.String({
		description: 'Last name of the user',
		example: 'Doe',
	}),
	roleName: Type.String({
		description: 'Role name of the user',
		example: 'Admin',
	}),
	updatedAt: Type.String({
		description: 'Last update date of the user',
		example: '2023-01-02T12:00:00Z',
		format: 'date-time',
	}),
}) {}

// register DTO OpenApi schema to Swagger
UserVo.registerOpenApi();
