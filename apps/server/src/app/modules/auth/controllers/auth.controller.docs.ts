import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { type DecoratorsLookUp } from '#libs/decorators';
import { HttpStatusCode } from '#libs/http';
import { LoginBodyDto } from '../dtos/login-body.dto';
import { RefreshAccessTokenDto } from '../dtos/refresh-access-token.dto';
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
		login: [
			ApiOperation({ summary: 'Log in a user' }),
			ApiBody({ schema: LoginBodyDto.refObj }),
			ApiResponse({
				description: 'User logged in successfully',
				status: HttpStatusCode.OK,
			}),
			ApiResponse({
				description: 'Invalid credentials',
				status: HttpStatusCode.UNAUTHORIZED,
			}),
		],
		logout: [
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
		refresh: [
			ApiOperation({ summary: 'Refresh access token' }),
			ApiBody({
				schema: RefreshAccessTokenDto.refObj,
			}),
			ApiResponse({
				description: 'Access token refreshed successfully',
				status: HttpStatusCode.OK,
			}),
			ApiResponse({
				description: 'Invalid or expired refresh token',
				status: HttpStatusCode.UNAUTHORIZED,
			}),
		],
	},
};
