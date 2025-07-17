import { type IBaseRepository, type Role, type User } from '#db';
export const USERS_REPOSITORY = 'UsersRepository';

import type { ProfileCreationAttributes } from '#db';

export type CreateUserWithDetailsDto = {
	email: string;
	password: string;
	roleId: number;
	profile?: Omit<ProfileCreationAttributes, 'userId'>;
};

export interface IUsersRepository extends IBaseRepository<User> {
	/**
	 * Finds a user by their email address.
	 * @param email The email address of the user to find.
	 * @returns A promise that resolves to the found user or null if not found.
	 */
	findOneByEmail(email: string): Promise<User | null>;
	/**
	 * Finds a user with permissions by their ID.
	 * @param id The ID of the user to find.
	 * @returns A promise that resolves to the found user or null if not found.
	 */
	findOneWithPermissions(id: string): Promise<User | null>;
	/**
	 * Finds a role by its ID.
	 * @param roleId The ID of the role to find.
	 * @returns A promise that resolves to the found role or null if not found.
	 */
	findRoleByRoleId(roleId: number): Promise<Role | null>;
	/**
	 * Creates a new user and their profile.
	 * @param createUserAndProfileDto The data to create the user and profile.
	 * @returns A promise that resolves to the created user.
	 * @throws {Error} if the user could not be created.
	 */
	createUserWithDetails(
		createUserAndProfileDto: CreateUserWithDetailsDto,
	): Promise<User>;
}
