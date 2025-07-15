import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { type User } from '#db';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from './auth.service';

const mockUser = {
	id: 'user-id',
	comparePassword: vi.fn(),
	compareRefreshToken: vi.fn(),
	email: 'test@example.com',
	refreshToken: 'some-refresh-token',
	tokenVersion: 0,
} as unknown as User & {
	comparePassword: Mock<() => Promise<boolean>>;
	compareRefreshToken: Mock<() => Promise<boolean>>;
};

const mockUsersService = {
	findOneByEmail: vi.fn(),
	findOneById: vi.fn(),
	incrementTokenVersion: vi.fn(),
	updateRefreshToken: vi.fn(),
};

const mockJwtService = {
	signAsync: vi.fn(),
};

describe('AuthService', () => {
	let service: AuthService;
	let usersService: UsersService;
	let jwtService: JwtService;

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: UsersService, useValue: mockUsersService },
				{ provide: JwtService, useValue: mockJwtService },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		usersService = module.get<UsersService>(UsersService);
		jwtService = module.get<JwtService>(JwtService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('signIn', () => {
		const loginBodyDto = {
			email: 'test@example.com',
			password: 'password',
		};

		it('should return tokens on successful sign-in', async () => {
			mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
			mockUser.comparePassword.mockResolvedValue(true);
			mockJwtService.signAsync
				.mockResolvedValueOnce('access-token')
				.mockResolvedValueOnce('refresh-token');
			mockUsersService.updateRefreshToken.mockResolvedValue(void 0);

			const result = await service.signIn(loginBodyDto);

			expect(usersService.findOneByEmail).toHaveBeenCalledWith(
				loginBodyDto.email,
			);
			expect(mockUser.comparePassword).toHaveBeenCalledWith(
				loginBodyDto.password,
			);
			expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
			expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
				mockUser.id,
				'refresh-token',
			);
			expect(result).toStrictEqual({
				accessToken: 'access-token',
				refreshToken: 'refresh-token',
			});
		});

		it('should throw UnauthorizedException if user not found', async () => {
			mockUsersService.findOneByEmail.mockResolvedValue(null);

			await expect(service.signIn(loginBodyDto)).rejects.toThrow(
				UnauthorizedException,
			);
		});

		it('should throw UnauthorizedException if password does not match', async () => {
			mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
			mockUser.comparePassword.mockResolvedValue(false);

			await expect(service.signIn(loginBodyDto)).rejects.toThrow(
				UnauthorizedException,
			);
		});
	});

	describe('signOut', () => {
		it('should call usersService.incrementTokenVersion', async () => {
			const userId = 'user-id';
			mockUsersService.incrementTokenVersion.mockResolvedValue(void 0);

			await service.signOut(userId);

			expect(usersService.incrementTokenVersion).toHaveBeenCalledWith(
				userId,
			);
		});
	});

	describe('refreshAccessToken', () => {
		const userId = 'user-id';
		const refreshToken = 'some-refresh-token';

		it('should return a new access token on successful refresh', async () => {
			mockUsersService.findOneById.mockResolvedValue(mockUser);
			mockUser.compareRefreshToken.mockResolvedValue(true);
			mockJwtService.signAsync.mockResolvedValue('new-access-token');

			const result = await service.refreshAccessToken(
				userId,
				refreshToken,
			);

			expect(usersService.findOneById).toHaveBeenCalledWith(userId);
			expect(mockUser.compareRefreshToken).toHaveBeenCalledWith(
				refreshToken,
			);
			expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
			expect(result).toStrictEqual({ accessToken: 'new-access-token' });
		});

		it('should throw ForbiddenException if user not found or has no refresh token', async () => {
			mockUsersService.findOneById.mockResolvedValue(null);
			await expect(
				service.refreshAccessToken(userId, refreshToken),
			).rejects.toThrow(ForbiddenException);

			mockUsersService.findOneById.mockResolvedValue({
				...mockUser,
				refreshToken: null,
			});
			await expect(
				service.refreshAccessToken(userId, refreshToken),
			).rejects.toThrow(ForbiddenException);
		});

		it('should throw ForbiddenException if refresh token does not match', async () => {
			mockUsersService.findOneById.mockResolvedValue(mockUser);
			mockUser.compareRefreshToken.mockResolvedValue(false);

			await expect(
				service.refreshAccessToken(userId, refreshToken),
			).rejects.toThrow(ForbiddenException);
		});
	});
});
