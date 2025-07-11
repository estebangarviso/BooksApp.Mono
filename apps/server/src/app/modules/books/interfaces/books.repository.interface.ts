import { Book, IBaseRepository } from '#db';
import { FindOptions } from 'sequelize';
import { CreateBookDto } from '../dtos/create-book.dto';

export const BOOKS_REPOSITORY = 'BooksRepository';

// NOTE: IBooksRepository now inherits all the standard methods.
// We can add book-specific methods here if needed in the future.
export interface IBooksRepository extends IBaseRepository<Book> {
	// example of a custom method:
	// findByAuthor(authorId: string): Promise<Book[]>;
	create(createBookDto: typeof CreateBookDto.schema.static): Promise<Book>;
	paginate(options?: FindOptions<Book> | undefined): Promise<{
		count: number;
		rows: Book[];
	}>;
}
