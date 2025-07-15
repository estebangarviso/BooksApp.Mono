import { env } from '#config';
import * as bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from './user.entity';

// mock the entire bcryptjs module.
// This is done once and will apply to all tests in this file.
vi.mock('bcryptjs', () => ({
	compare: vi.fn(),
	genSalt: vi.fn().mockResolvedValue('mock-salt'),
	hash: vi.fn().mockResolvedValue('hashed-value'),
}));

describe('User Entity', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('hashPassword (Static Method)', () => {
		it('should hash password when it has changed', async () => {
			// arrange: Create a mock instance with only the methods and properties
			// the static `hashPassword` method will interact with.
			const mockUserInstance = {
				changed: vi.fn().mockReturnValue(true), // simulate the password has changed
				getDataValue: vi.fn().mockReturnValue('plain-password'),
				password: 'plain-password',
				setDataValue: vi.fn(),
			};

			// act: Call the static method with our mock instance.
			await User.hashPassword(mockUserInstance as any);

			// assert: Verify the correct functions were called with the correct arguments.
			expect(mockUserInstance.changed).toHaveBeenCalledWith('password');
			expect(bcrypt.genSalt).toHaveBeenCalledWith(
				env.APP.SECURITY.BCRYPT.SALT_ROUNDS,
			);
			expect(bcrypt.hash).toHaveBeenCalledWith(
				'plain-password',
				'mock-salt',
			);
			expect(mockUserInstance.setDataValue).toHaveBeenCalledWith(
				'password',
				'hashed-value',
			);
		});

		it('should NOT hash password when it has not changed', async () => {
			// arrange
			const mockUserInstance = {
				changed: vi.fn().mockReturnValue(false), // simulate the password has NOT changed
				password: 'plain-password',
				setDataValue: vi.fn(),
			};

			// act
			await User.hashPassword(mockUserInstance as any);

			// assert: Verify that no hashing operations took place.
			expect(bcrypt.genSalt).not.toHaveBeenCalled();
			expect(bcrypt.hash).not.toHaveBeenCalled();
			expect(mockUserInstance.setDataValue).not.toHaveBeenCalled();
		});
	});

	// testing an INSTANCE method: user.hasAccess()
	describe('hasAccess (Instance Method)', () => {
		it('should return true when user is active and does not need to change password', () => {
			// arrange: Create a plain object representing the state of the user.
			const userState = {
				isActive: true,
				mustChangePassword: false,
			};

			// act: Call the real method from the User's prototype, using our state object as `this`.
			const result = User.prototype.hasAccess.call(userState);

			// assert
			expect(result).toBe(true);
		});

		it('should return false when user is not active', () => {
			// arrange
			const userState = {
				isActive: false,
				mustChangePassword: false,
			};

			// act
			const result = User.prototype.hasAccess.call(userState);

			// assert
			expect(result).toBe(false);
		});

		it('should return false when user must change password', () => {
			// arrange
			const userState = {
				isActive: true,
				mustChangePassword: true,
			};

			// act
			const result = User.prototype.hasAccess.call(userState);

			// assert
			expect(result).toBe(false);
		});
	});

	// testing an INSTANCE method: user.comparePassword()
	describe('comparePassword (Instance Method)', () => {
		it('should call bcrypt.compare and return true for matching passwords', async () => {
			// arrange
			const userState = { password: 'hashed-password' };
			vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

			// act
			const result = await User.prototype.comparePassword.call(
				userState,
				'plain-password',
			);

			// assert
			expect(bcrypt.compare).toHaveBeenCalledWith(
				'plain-password',
				'hashed-password',
			);
			expect(result).toBe(true);
		});

		it('should call bcrypt.compare and return false for non-matching passwords', async () => {
			// arrange
			const userState = { password: 'hashed-password' };
			vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

			// act
			const result = await User.prototype.comparePassword.call(
				userState,
				'wrong-password',
			);

			// assert
			expect(bcrypt.compare).toHaveBeenCalledWith(
				'wrong-password',
				'hashed-password',
			);
			expect(result).toBe(false);
		});
	});

	// testing an INSTANCE method: user.compareRefreshToken()
	describe('compareRefreshToken (Instance Method)', () => {
		it('should return false if no token exists on the user', async () => {
			// arrange
			const userState = { refreshToken: null };

			// act
			const result = await User.prototype.compareRefreshToken.call(
				userState,
				'any-token',
			);

			// assert
			expect(bcrypt.compare).not.toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should call bcrypt.compare for an existing token', async () => {
			// arrange
			const userState = { refreshToken: 'hashed-refresh-token' };
			vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

			// act
			await User.prototype.compareRefreshToken.call(
				userState,
				'actual-refresh-token',
			);

			// assert
			expect(bcrypt.compare).toHaveBeenCalledWith(
				'actual-refresh-token',
				'hashed-refresh-token',
			);
		});
	});

	// testing an INSTANCE method: user.updateRefreshToken()
	describe('updateRefreshToken (Instance Method)', () => {
		it('should hash and set a new refresh token', async () => {
			// arrange: The mock instance needs a `save` method and a `refreshToken` property
			// that can be updated.
			const mockInstance = {
				refreshToken: null as string | null,
				save: vi.fn().mockResolvedValue(true),
			};

			// act
			await User.prototype.updateRefreshToken.call(
				mockInstance,
				'new-refresh-token',
			);

			// assert
			expect(bcrypt.hash).toHaveBeenCalledWith(
				'new-refresh-token',
				'mock-salt',
			);
			expect(mockInstance.refreshToken).toBe('hashed-value');
			expect(mockInstance.save).toHaveBeenCalled();
		});

		it('should set the refresh token to null', async () => {
			// arrange
			const mockInstance = {
				refreshToken: 'existing-hashed-token',
				save: vi.fn().mockResolvedValue(true),
			};

			// act
			await User.prototype.updateRefreshToken.call(mockInstance, null);

			// assert
			expect(bcrypt.hash).not.toHaveBeenCalled();
			expect(mockInstance.refreshToken).toBeNull();
			expect(mockInstance.save).toHaveBeenCalled();
		});
	});
});
