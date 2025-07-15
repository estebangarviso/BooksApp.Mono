import { Test, type TestingModule } from '@nestjs/testing';
import { AuthGuards } from '#libs/decorators';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../services/users.service';
import { UsersController } from './users.controller';

const mockUsersService = {
	createUserWithDetails: vi.fn(),
};

// mock for guards that might be applied by the custom @AuthGuards() decorator.
// This approach assumes you know which guards are applied by the decorator.
// If the decorator applies guards globally, you might need a different approach.
const mockAuthGuards = {
	canActivate: vi.fn(() => true),
};

describe(UsersController.name, () => {
	let controller: UsersController;
	let service: UsersService;

	beforeEach(async () => {
		vi.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
			],
			controllers: [UsersController],
		})
			.overrideGuard(AuthGuards)
			.useValue(mockAuthGuards)
			.compile();

		controller = module.get<UsersController>(UsersController);
		service = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('createUser', () => {
		it('should call userService.createUserWithDetails with the provided DTO', async () => {
			const createUserDto: CreateUserDto = {
				email: 'test@example.com',
				password: 'password123',
			};
			const expectedUser = {
				id: '1',
				email: 'test@example.com',
				password: 'hashedpassword',
				tokenVersion: 0,
			};
			mockUsersService.createUserWithDetails.mockResolvedValue(
				expectedUser,
			);

			const result = await controller.createUser(createUserDto);

			expect(service.createUserWithDetails).toHaveBeenCalledWith(
				createUserDto,
			);
			expect(result).toStrictEqual(expectedUser);
		});
	});
});
