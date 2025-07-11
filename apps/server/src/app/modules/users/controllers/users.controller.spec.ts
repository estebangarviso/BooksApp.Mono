import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../services/users.service';
import { UsersController } from './users.controller';

const mockUsersService = {
	create: vi.fn(),
};

// mock for guards that might be applied by the custom @AuthGuards() decorator.
// This approach assumes you know which guards are applied by the decorator.
// If the decorator applies guards globally, you might need a different approach.
const mockAuthGuard = {
	canActivate: vi.fn(() => true),
};

describe('UsersController', () => {
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
			// this is a generic way to override a guard.
			// Replace `mockAuthGuard` with the actual guard class if you know it.
			// For a custom decorator like @AuthGuards(), you might need to override
			// each guard it applies (e.g., AccessTokenAuthGuard, RolesGuard).
			.overrideGuard('AuthGuards')
			.useValue(mockAuthGuard)
			.compile();

		controller = module.get<UsersController>(UsersController);
		service = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('createUser', () => {
		it('should call userService.create with the provided DTO', async () => {
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
			mockUsersService.create.mockResolvedValue(expectedUser);

			const result = await controller.createUser(createUserDto);

			expect(service.create).toHaveBeenCalledWith(createUserDto);
			expect(result).toStrictEqual(expectedUser);
		});
	});
});
