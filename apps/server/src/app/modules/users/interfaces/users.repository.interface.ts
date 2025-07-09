import { type IBaseRepository, type User } from '#db';

export const USER_REPOSITORY = 'UsersRepository';

// NOTE: IBooksRepository now inherits all the standard methods.
// We can add book-specific methods here if needed in the future.
export interface IUsersRepository extends IBaseRepository<User> {
	// example of a custom method:
	// findByAuthor(authorId: string): Promise<Book[]>;
}
