import { Type } from '@sinclair/typebox';
import { AjvDto } from '#libs/ajv';

export class CreateUserResponseDto extends AjvDto(
	{
		email: Type.String({ format: 'email', maxLength: 63 }),
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
CreateUserResponseDto.registerOpenApi();
