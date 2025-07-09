import { type Static, Type } from '@sinclair/typebox';
import { AjvDto } from '#libs/ajv';

export class LoginDto extends AjvDto({
	password: Type.String({ description: 'Password', example: 'password123' }),
	username: Type.String({ description: 'Username', example: 'johndoe' }),
}) {}

export type TLoginDto = Static<typeof LoginDto.schema>;

LoginDto.registerOpenApi();
