import { type IBaseRepository, type User } from '#db';

export const USERS_REPOSITORY = 'UsersRepository';

export interface IUsersRepository extends IBaseRepository<User> {
	findOneByUsername(email: string): Promise<User | null>;
	findWithPermissions(id: string): Promise<User | null>;
}
