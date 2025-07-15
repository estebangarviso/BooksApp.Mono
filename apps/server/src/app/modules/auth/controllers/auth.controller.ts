import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { GetCurrentUserId } from '#libs/decorators';
import { AttributeBasedAccessGuard } from '#libs/guards';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator';
import { JwtTokensDto } from '../dtos/jwt-tokens.dto';
import { LoginBodyDto } from '../dtos/login-body.dto';
import { LogoutResponseDto } from '../dtos/logout-response.dto';
import { RefreshAccessTokenDto } from '../dtos/refresh-access-token.dto';
import { RefreshAccessGuard } from '../guards/refresh-access.guard';
import { AuthService } from '../services/auth.service';
import { AuthControllerDocs } from './auth.controller.docs';

@ApplyControllerDocs(AuthControllerDocs)
@Controller('auth')
export class AuthController {
	constructor(private readonly _authService: AuthService) {}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	login(@Body() loginBodyDto: LoginBodyDto): Promise<JwtTokensDto> {
		return this._authService.signIn(loginBodyDto);
	}

	@UseGuards(AttributeBasedAccessGuard)
	@HttpCode(HttpStatus.OK)
	@Post('logout')
	async logout(
		@GetCurrentUserId() userId: string,
	): Promise<LogoutResponseDto> {
		await this._authService.signOut(userId);
		return { message: 'User logged out successfully' };
	}

	@UseGuards(RefreshAccessGuard)
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	refresh(
		@GetCurrentUserId() userId: string,
		@Body('refreshToken') refreshToken: string,
	): Promise<RefreshAccessTokenDto> {
		return this._authService.refreshAccessToken(userId, refreshToken);
	}
}
