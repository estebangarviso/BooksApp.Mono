import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiProduces,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { type DecoratorsLookUp } from '#libs/decorators';
import { HttpStatusCode } from '#libs/http';
import { LoginDto } from '../schemas/login.dto';
import { type AuthController } from './auth.controller';

export const AuthControllerDocs: DecoratorsLookUp<AuthController> = {
	class: [ApiTags('Authentication')],
	common: {
		method: [
			ApiResponse({
				description: 'Internal error',
				status: HttpStatusCode.INTERNAL_SERVER_ERROR,
			}),
		],
	},
	method: {
		signIn: [
			ApiOperation({ summary: 'Log in a user' }),
			ApiBody({ schema: LoginDto.schema as any }),
			ApiResponse({
				description: 'User logged in successfully',
				status: HttpStatusCode.OK,
			}),
			ApiResponse({
				description: 'Invalid credentials',
				status: HttpStatusCode.UNAUTHORIZED,
			}),
		],
		signOut: [
			ApiOperation({ summary: 'Log out a user' }),
			ApiResponse({
				description: 'User logged out successfully',
				status: HttpStatusCode.OK,
			}),
			ApiResponse({
				description: 'User not found or already logged out',
				status: HttpStatusCode.NOT_FOUND,
			}),
		],
	},
};
