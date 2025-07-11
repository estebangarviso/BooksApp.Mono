import { Type } from '@sinclair/typebox';
import { AjvDto } from '#libs/ajv';

export class LogoutResponseDto extends AjvDto({
	message: Type.String({
		description: 'Message',
		example: 'Login successful',
	}),
}) {}

LogoutResponseDto.registerOpenApi();
