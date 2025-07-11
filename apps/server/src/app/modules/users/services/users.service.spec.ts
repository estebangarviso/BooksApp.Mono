import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateUserDto } from '../dtos/create-user.dto';
import {
	type IUsersRepository,
	USERS_REPOSITORY,
} from '../interfaces/users.repository.interface';
import { UsersService } from './users.service';

const mockUsersRepository: IUsersRepository = {
	count: vi.fn(),
	create: vi.fn(),
	findAll: vi.fn(),
	findOne: vi.fn(),
	findOneByUsername: vi.fn(),
	findWithPermissions: vi.fn(),
	paginate: vi.fn(),
	softDelete: vi.fn(),
	update: vi.fn(),
};

describe('UsersService', () => {
	let service: UsersService;
	let repository: IUsersRepository;

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
			await service.findOneByUsername(email);
			expect(repository.findOneByUsername).toHaveBeenCalledWith(email);
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
			await service.findWithPermissions(id);
			expect(repository.findWithPermissions).toHaveBeenCalledWith(id);
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

	describe('create', () => {
		it('should create and return a user', async () => {
			const createUserDto: CreateUserDto = {
				email: 'new@example.com',
				password: 'password',
			};
			const createdUser = { id: 'new-user-id', ...createUserDto };
			vi.spyOn(repository, 'create').mockResolvedValue(
				createdUser as any,
			);

			const result = await service.create(createUserDto);

			expect(repository.create).toHaveBeenCalledWith(createUserDto);
			expect(result).toStrictEqual(createdUser);
		});

		it('should throw NotFoundException if user could not be created', async () => {
			const createUserDto: CreateUserDto = {
				email: 'new@example.com',
				password: 'password',
			};
			vi.spyOn(repository, 'create').mockResolvedValue(void 0);

			await expect(service.create(createUserDto)).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.create(createUserDto)).rejects.toThrow(
				'User could not be created',
			);
		});

		it('should throw NotFoundException if repository throws an error', async () => {
			const createUserDto: CreateUserDto = {
				email: 'new@example.com',
				password: 'password',
			};
			const error = new Error('DB error');
			vi.spyOn(repository, 'create').mockRejectedValue(error);

			await expect(service.create(createUserDto)).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.create(createUserDto)).rejects.toThrow(
				'User could not be created',
			);
		});
	});
});
