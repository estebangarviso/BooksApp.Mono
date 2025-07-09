import { type Book, type IBaseRepository } from '#db';
import { type FindOptions } from 'sequelize';
import { type TCreateBookDto } from '../schemas/create-book.dto';

export const BOOKS_REPOSITORY = 'BooksRepository';

// NOTE: IBooksRepository now inherits all the standard methods.
// We can add book-specific methods here if needed in the future.
export interface IBooksRepository extends IBaseRepository<Book> {
	// example of a custom method:
	// findByAuthor(authorId: string): Promise<Book[]>;
	create(createBookDto: TCreateBookDto): Promise<Book>;
	paginate(options?: FindOptions<Book> | undefined): Promise<{
		count: number;
		rows: Book[];
	}>;
}
