import { Type } from '@sinclair/typebox';
import { AjvDto } from '#libs/ajv';

export class CreateUserDto extends AjvDto(
	{
		email: Type.String({
			description: 'User email address',
			format: 'email',
			maxLength: 63,
		}),
		firstName: Type.String({
			description: 'User first name',
			example: 'John',
			maxLength: 63,
		}),
		lastName: Type.String({
			description: 'User last name',
			example: 'Doe',
			maxLength: 63,
		}),
		roleId: Type.Integer({
			description: 'ID of the role assigned to the user',
			example: 1,
		}),
	},
	{
		additionalProperties: false,
	},
) {}

// register DTO OpenApi schema to Swagger
CreateUserDto.registerOpenApi();
