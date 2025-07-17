import { Test, type TestingModule } from '@nestjs/testing';
import { AttributeBasedAccessGuard } from '#libs/guards';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JwtTokensDto } from '../dtos/jwt-tokens.dto.ts';
import { type LoginBodyDto } from '../dtos/login-body.dto';
import { RefreshAccessGuard } from '../guards/refresh-access.guard.ts';
import { AuthService } from '../services/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
	let controller: AuthController;
	let authService: AuthService;

	const mockAuthService = {
		refreshAccessToken: vi.fn(),
		signIn: vi.fn(),
		signOut: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: AuthService,
					useValue: mockAuthService,
				},
			],
			controllers: [AuthController],
		})
			.overrideGuard(AttributeBasedAccessGuard)
			.useValue({ canActivate: () => true })
			.overrideGuard(RefreshAccessGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('login', () => {
		it('should call authService.signIn and return tokens', async () => {
			const loginBodyDto: LoginBodyDto = {
				email: 'demo@demo.com',
				password: 'password',
			};
			const tokens: JwtTokensDto = {
				accessToken: 'access',
				refreshToken: 'refresh',
			};
			mockAuthService.signIn.mockResolvedValue(tokens);

			const result = await controller.login(loginBodyDto);

			expect(authService.signIn).toHaveBeenCalledWith(loginBodyDto);
			expect(result).toStrictEqual(tokens);
		});
	});

	describe('logout', () => {
		it('should call authService.signOut and return success message', async () => {
			const userId = '123';
			mockAuthService.signOut.mockResolvedValue(void 0);

			const result = await controller.logout(userId);

			expect(authService.signOut).toHaveBeenCalledWith(userId);
			expect(result).toStrictEqual({
				message: 'User logged out successfully',
			});
		});
	});

	describe('refresh', () => {
		it('should call authService.refreshAccessToken and return new access token', async () => {
			const userId = '123';
			const refreshToken = 'old-refresh-token';
			const newAccessToken = { accessToken: 'new-access-token' };
			mockAuthService.refreshAccessToken.mockResolvedValue(
				newAccessToken,
			);

			const result = await controller.refresh(userId, refreshToken);

			expect(authService.refreshAccessToken).toHaveBeenCalledWith(
				userId,
				refreshToken,
			);
			expect(result).toStrictEqual(newAccessToken);
		});
	});
});
