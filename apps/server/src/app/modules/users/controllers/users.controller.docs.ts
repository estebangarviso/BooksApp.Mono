import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { type DecoratorsLookUp } from '#libs/decorators';
import { HttpStatusCode } from '#libs/http';
import { CreateUserDto } from '../dtos/create-user.dto';
import { type UsersController } from './users.controller';

export const UsersControllerDocs: DecoratorsLookUp<UsersController> = {
	class: [ApiTags('Users'), ApiBearerAuth()],
	common: {
		method: [
			ApiResponse({
				description: 'Internal error',
				status: 500,
			}),
		],
	},
	method: {
		createUser: [
			ApiOperation({ summary: 'Create a new user' }),
			ApiBody({ schema: CreateUserDto.refObj }),
			ApiResponse({
				description: 'User created successfully',
				status: HttpStatusCode.CREATED,
			}),
		],
	},
};
