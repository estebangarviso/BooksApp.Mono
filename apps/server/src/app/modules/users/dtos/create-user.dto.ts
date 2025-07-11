import { Type } from '@sinclair/typebox';
import { env } from '#config';
import { AjvDto } from '#libs/ajv';

export class CreateUserDto extends AjvDto(
	{
		email: Type.String({ format: 'email', maxLength: 63 }),
		roleId: Type.Optional(Type.String()),
		password: Type.String({
			maxLength: 64,
			minLength: env.APP.MIN_PASSWORD_LENGTH,
		}),
		profile: Type.Optional(
			Type.Object({
				firstName: Type.String(),
				lastName: Type.String(),
			}),
		),
	},
	{
		additionalProperties: false,
	},
) {}

// register DTO OpenApi schema to Swagger
CreateUserDto.registerOpenApi();
