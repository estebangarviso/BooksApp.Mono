import { Type } from '@sinclair/typebox';
import { AjvDto } from '#libs/ajv';

export class LoginBodyDto extends AjvDto({
	password: Type.String({ description: 'Password', example: 'password123' }),
	email: Type.String({
		description: 'Email',
		example: 'johndoe@example.com',
	}),
}) {}

LoginBodyDto.registerOpenApi();
