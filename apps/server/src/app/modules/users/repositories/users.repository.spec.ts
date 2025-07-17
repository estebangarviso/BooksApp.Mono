import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, type TestingModule } from '@nestjs/testing';
import { Permission, Profile, Role, User } from '#db';
import { Sequelize } from 'sequelize';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CreateUserWithDetailsDto } from '../interfaces/users.repository.interface';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
	let repository: UsersRepository;
	let userModel: typeof User;
	let roleModel: typeof Role;
	let profileModel: typeof Profile;
	let sequelize: Sequelize;

	const mockUser = {
		id: 'user-id',
		$set: vi.fn(),
		email: 'test@example.com',
		password: 'hashed-password',
		roleId: 1,
	};

	const mockRole = {
		id: 1,
		name: 'Admin',
	};

	const mockProfile = {
		id: 'profile-id',
		firstName: 'John',
		lastName: 'Doe',
		userId: 'user-id',
	};

	const mockNewUserId = 'new-user-id';

	const mockTransaction = {
		commit: vi.fn(),
		rollback: vi.fn(),
	};

	beforeEach(async () => {
		vi.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersRepository,
				{
					provide: getModelToken(User),
					useValue: {
						create: vi.fn(),
						findByPk: vi.fn(),
						findOne: vi.fn(),
					},
				},
				{
					provide: getModelToken(Role),
					useValue: {
						findByPk: vi.fn(),
					},
				},
				{
					provide: getModelToken(Profile),
					useValue: {
						upsert: vi.fn(),
					},
				},
				{
					provide: Sequelize,
					useValue: {
						transaction: vi.fn().mockResolvedValue(mockTransaction),
					},
				},
			],
		}).compile();

		repository = module.get<UsersRepository>(UsersRepository);
		userModel = module.get<typeof User>(getModelToken(User));
		roleModel = module.get<typeof Role>(getModelToken(Role));
		profileModel = module.get<typeof Profile>(getModelToken(Profile));
		sequelize = module.get<Sequelize>(Sequelize);
	});

	it('should be defined', () => {
		expect(repository).toBeDefined();
	});

	describe('findOneByEmail', () => {
		it('should find a user by email', async () => {
			vi.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);

			const result = await repository.findOneByEmail('test@example.com');

			expect(userModel.findOne).toHaveBeenCalledWith({
				where: { email: 'test@example.com' },
			});
			expect(result).toStrictEqual(mockUser);
		});

		it('should return null if user not found', async () => {
			vi.spyOn(userModel, 'findOne').mockResolvedValue(null);

			const result = await repository.findOneByEmail(
				'nonexistent@example.com',
			);

			expect(result).toBeNull();
		});
	});

	describe('findOneWithPermissions', () => {
		it('should find a user with permissions', async () => {
			vi.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);

			const result = await repository.findOneWithPermissions('user-id');

			expect(userModel.findByPk).toHaveBeenCalledWith('user-id', {
				include: [
					{
						include: [Permission],
						model: Role,
					},
				],
			});
			expect(result).toStrictEqual(mockUser);
		});

		it('should return null if user not found', async () => {
			vi.spyOn(userModel, 'findByPk').mockResolvedValue(null);

			const result =
				await repository.findOneWithPermissions('nonexistent-id');

			expect(result).toBeNull();
		});
	});

	describe('findRoleByRoleId', () => {
		it('should find a role by ID', async () => {
			vi.spyOn(roleModel, 'findByPk').mockResolvedValue(mockRole as any);

			const result = await repository.findRoleByRoleId(1);

			expect(roleModel.findByPk).toHaveBeenCalledWith(1);
			expect(result).toStrictEqual(mockRole);
		});

		it('should return null if role not found', async () => {
			vi.spyOn(roleModel, 'findByPk').mockResolvedValue(null);

			const result = await repository.findRoleByRoleId(999);

			expect(result).toBeNull();
		});

		it('should throw BadRequestException if an error occurs', async () => {
			const error = new Error('Database error');
			vi.spyOn(roleModel, 'findByPk').mockRejectedValue(error);

			await expect(repository.findRoleByRoleId(1)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe('createUserWithDetails', () => {
		const createUserDto: CreateUserWithDetailsDto = {
			email: 'new@example.com',
			password: 'password123',
			roleId: 1,
			profile: {
				firstName: 'Jane',
				lastName: 'Smith',
			},
		};

		it('should create a user with profile successfully', async () => {
			const createdUser = {
				...mockUser,
				id: mockNewUserId,
				$set: vi.fn().mockResolvedValue(true),
				email: createUserDto.email,
				save: vi.fn().mockResolvedValue({
					...mockUser,
					id: mockNewUserId,
					email: createUserDto.email,
				}),
			};

			vi.spyOn(userModel, 'create').mockResolvedValue(createdUser as any);
			vi.spyOn(profileModel, 'upsert').mockResolvedValue([
				{
					...mockProfile,
					firstName: createUserDto.profile?.firstName,
					lastName: createUserDto.profile?.lastName,
					userId: mockNewUserId,
				} as any,
				true,
			]);

			const result =
				await repository.createUserWithDetails(createUserDto);

			expect(sequelize.transaction).toHaveBeenCalled();
			expect(userModel.create).toHaveBeenCalledWith(
				{
					email: createUserDto.email,
					password: createUserDto.password,
					roleId: createUserDto.roleId,
				},
				{
					include: [Profile, Role],
					transaction: mockTransaction,
				},
			);

			expect(profileModel.upsert).toHaveBeenCalledWith(
				{
					firstName: createUserDto.profile?.firstName,
					lastName: createUserDto.profile?.lastName,
					userId: mockNewUserId,
				},
				{ transaction: mockTransaction },
			);

			expect(createdUser.$set).toHaveBeenCalledWith(
				'profile',
				expect.anything(),
				{ transaction: mockTransaction },
			);

			expect(createdUser.save).toHaveBeenCalledWith({
				transaction: mockTransaction,
			});
			expect(mockTransaction.commit).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it('should create a user without profile', async () => {
			const userDtoWithoutProfile = { ...createUserDto };
			delete userDtoWithoutProfile.profile;

			const createdUser = {
				...mockUser,
				id: mockNewUserId,
				email: userDtoWithoutProfile.email,
				save: vi.fn().mockResolvedValue({
					...mockUser,
					id: mockNewUserId,
					email: userDtoWithoutProfile.email,
				}),
			};

			vi.spyOn(userModel, 'create').mockResolvedValue(createdUser as any);

			const result = await repository.createUserWithDetails(
				userDtoWithoutProfile,
			);

			expect(sequelize.transaction).toHaveBeenCalled();
			expect(userModel.create).toHaveBeenCalled();
			expect(profileModel.upsert).not.toHaveBeenCalled();
			expect(mockTransaction.commit).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it('should throw BadRequestException if user creation fails', async () => {
			vi.spyOn(userModel, 'create').mockResolvedValue(null);

			await expect(
				repository.createUserWithDetails(createUserDto),
			).rejects.toThrow(BadRequestException);

			expect(mockTransaction.rollback).toHaveBeenCalled();
			expect(mockTransaction.commit).not.toHaveBeenCalled();
		});

		it('should throw BadRequestException if profile update fails', async () => {
			const createdUser = {
				...mockUser,
				id: mockNewUserId,
				$set: vi.fn(),
				email: createUserDto.email,
				save: vi.fn(),
			};

			vi.spyOn(userModel, 'create').mockResolvedValue(createdUser as any);
			vi.spyOn(profileModel, 'upsert').mockResolvedValue([
				null as unknown as Profile,
				false,
			]);

			await expect(
				repository.createUserWithDetails(createUserDto),
			).rejects.toThrow(BadRequestException);

			expect(mockTransaction.rollback).toHaveBeenCalled();
			expect(mockTransaction.commit).not.toHaveBeenCalled();
		});

		it('should throw BadRequestException and rollback transaction on error', async () => {
			const error = new Error('Database error');
			vi.spyOn(userModel, 'create').mockRejectedValue(error);

			await expect(
				repository.createUserWithDetails(createUserDto),
			).rejects.toThrow(BadRequestException);

			expect(mockTransaction.rollback).toHaveBeenCalled();
			expect(mockTransaction.commit).not.toHaveBeenCalled();
		});
	});
});
