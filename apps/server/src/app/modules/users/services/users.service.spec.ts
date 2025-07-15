import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { env } from '#config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateUserResponseDto } from '../dtos/create-user-response.dto.ts';
import type { CreateUserDto } from '../dtos/create-user.dto';
import {
	type IUsersRepository,
	USERS_REPOSITORY,
} from '../interfaces/users.repository.interface';
import { UsersService } from './users.service';

const mockUsersRepository: IUsersRepository = {
	count: vi.fn(),
	create: vi.fn(),
	createUserWithDetails: vi.fn(),
	delete: vi.fn(),
	findAll: vi.fn(),
	findAndCountAll: vi.fn(),
	findOne: vi.fn(),
	findOneByEmail: vi.fn(),
	findOneWithPermissions: vi.fn(),
	findRoleByRoleId: vi.fn(),
	paginate: vi.fn(),
	update: vi.fn(),
};

describe(UsersService.name, () => {
	let service: UsersService;
	let repository: IUsersRepository;

	const createUserDto: typeof CreateUserDto.schema.static = {
		email: 'new@example.com',
		firstName: 'First',
		lastName: 'Last',
		roleId: 1,
	};

	const mockGeneratedPassword = 'password123';
	beforeEach(async () => {
		vi.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: USERS_REPOSITORY,
					useValue: mockUsersRepository,
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		repository = module.get<IUsersRepository>(USERS_REPOSITORY);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findOneByUsername', () => {
		it('should call repository.findOneByUsername with the correct email', async () => {
			const email = 'test@example.com';
			await service.findOneByEmail(email);
			expect(repository.findOneByEmail).toHaveBeenCalledWith(email);
		});
	});

	describe('findOneById', () => {
		it('should call repository.findOne with the correct id', async () => {
			const id = 'user-id';
			await service.findOneById(id);
			expect(repository.findOne).toHaveBeenCalledWith(id);
		});
	});

	describe('findWithPermissions', () => {
		it('should call repository.findWithPermissions with the correct id', async () => {
			const id = 'user-id';
			await service.findOneWithPermissions(id);
			expect(repository.findOneWithPermissions).toHaveBeenCalledWith(id);
		});
	});

	describe('updateRefreshToken', () => {
		it('should update the refresh token for a user', async () => {
			const userId = 'user-id';
			const refreshToken = 'new-refresh-token';
			const mockUser = {
				updateRefreshToken: vi.fn().mockResolvedValue(void 0),
			};
			vi.spyOn(service, 'findOneById').mockResolvedValue(mockUser as any);

			await service.updateRefreshToken(userId, refreshToken);

			expect(service.findOneById).toHaveBeenCalledWith(userId);
			expect(mockUser.updateRefreshToken).toHaveBeenCalledWith(
				refreshToken,
			);
		});

		it('should throw NotFoundException if user is not found', async () => {
			const userId = 'non-existent-user';
			vi.spyOn(service, 'findOneById').mockResolvedValue(null);

			await expect(
				service.updateRefreshToken(userId, 'token'),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('incrementTokenVersion', () => {
		it('should increment the token version for a user', async () => {
			const userId = 'user-id';
			const mockUser = {
				save: vi.fn().mockResolvedValue(void 0),
				tokenVersion: 1,
			};
			vi.spyOn(service, 'findOneById').mockResolvedValue(mockUser as any);

			await service.incrementTokenVersion(userId);

			expect(service.findOneById).toHaveBeenCalledWith(userId);
			expect(mockUser.tokenVersion).toBe(2);
			expect(mockUser.save).toHaveBeenCalled();
		});

		it('should throw NotFoundException if user is not found', async () => {
			const userId = 'non-existent-user';
			vi.spyOn(service, 'findOneById').mockResolvedValue(null);

			await expect(service.incrementTokenVersion(userId)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('createUserWithDetails', () => {
		it('should create and return a transform user', async () => {
			const expectedResult: typeof CreateUserResponseDto.schema.static = {
				id: 'new-user-id',
				createdAt: new Date().toISOString(),
				email: createUserDto.email,
				firstName: createUserDto.firstName,
				hasAccess: true,
				lastName: createUserDto.lastName,
				roleName: 'Admin',
				updatedAt: new Date().toISOString(),
			};

			const expectedCreateUserWithDetailsCalledWith = {
				email: createUserDto.email,
				password: mockGeneratedPassword,
				roleId: createUserDto.roleId,
				profile: {
					firstName: createUserDto.firstName,
					lastName: createUserDto.lastName,
				},
			};

			const mockReturnedUser = {
				id: expectedResult.id,
				createdAt: expectedResult.createdAt,
				email: expectedResult.email,
				hasAccess: vi.fn().mockReturnValue(true),
				password: mockGeneratedPassword,
				roleId: createUserDto.roleId,
				updatedAt: expectedResult.updatedAt,
				profile: {
					firstName: expectedResult.firstName,
					lastName: expectedResult.lastName,
				},
				role: {
					name: expectedResult.roleName,
				},
			};

			vi.spyOn(repository, 'createUserWithDetails').mockResolvedValue(
				mockReturnedUser as any,
			);
			vi.spyOn(repository, 'findOneByEmail').mockResolvedValue(null);
			vi.spyOn(repository, 'findRoleByRoleId').mockResolvedValue({
				id: 1,
				name: 'Admin',
			} as any);
			vi.spyOn(service as any, '_generateRandomPassword').mockReturnValue(
				mockGeneratedPassword,
			);

			const result = await service.createUserWithDetails(
				createUserDto as typeof CreateUserDto.schema.static,
			);

			expect(repository.createUserWithDetails).toHaveBeenCalledWith(
				expectedCreateUserWithDetailsCalledWith,
			);
			expect(result).toStrictEqual(expectedResult);
		});

		it('should throw NotFoundException if user could not be created', async () => {
			vi.spyOn(repository, 'createUserWithDetails').mockResolvedValue(
				void 0 as any,
			);

			await expect(
				service.createUserWithDetails(
					createUserDto as typeof CreateUserDto.schema.static,
				),
			).rejects.toThrow(NotFoundException);
			await expect(
				service.createUserWithDetails(
					createUserDto as typeof CreateUserDto.schema.static,
				),
			).rejects.toThrow('User could not be created');
		});

		it('should throw NotFoundException if repository throws an error', async () => {
			const error = new Error('DB error');
			vi.spyOn(repository, 'create').mockRejectedValue(error);

			await expect(
				service.createUserWithDetails(
					createUserDto as typeof CreateUserDto.schema.static,
				),
			).rejects.toThrow(NotFoundException);
			await expect(
				service.createUserWithDetails(
					createUserDto as typeof CreateUserDto.schema.static,
				),
			).rejects.toThrow('User could not be created');
		});
	});

	describe('_generateRandomPassword', () => {
		it('should generate a password of the default length', () => {
			const password = service['_generateRandomPassword']();
			expect(password).toHaveLength(env.APP.MIN_PASSWORD_LENGTH);
		});

		it('should generate a password of a specified length', () => {
			const length = 12;
			const password = service['_generateRandomPassword'](length);
			expect(password).toHaveLength(length);
		});

		it('should only contain characters from the defined charset', () => {
			const charset =
				'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
			const password = service['_generateRandomPassword'](20);
			for (const char of password) {
				expect(charset).toContain(char);
			}
		});

		it('should generate different passwords on subsequent calls', () => {
			const passwordA = service['_generateRandomPassword']();
			const passwordB = service['_generateRandomPassword']();
			expect(passwordA).not.toStrictEqual(passwordB);
		});
	});
});
