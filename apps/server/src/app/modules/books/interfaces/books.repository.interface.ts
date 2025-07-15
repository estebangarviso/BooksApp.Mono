import {
	type Book,
	type BookAttributes,
	type IBaseRepository,
	type PaginateResult,
} from '#db';
import {
	type Attributes,
	type CreateOptions,
	type FindOptions,
	type Order,
	type WhereOptions,
} from 'sequelize';
import { type CreateBookDto } from '../dtos/create-book.dto';
import type { CreatedBookDto } from '../dtos/created-book.dto.ts';

export const BOOKS_REPOSITORY = 'BooksRepository';

// NOTE: IBooksRepository now inherits all the standard methods.
// We can add book-specific methods here if needed in the future.
export interface IBooksRepository extends IBaseRepository<Book> {
	findAllForExport(includeDeleted?: boolean): AsyncGenerator<Book>;
	createWithDetails(
		createBookDto: CreateBookDto,
		options?: CreateOptions<Attributes<Book>>,
	): Promise<typeof CreatedBookDto.schema.static>;
	findByIsbn(
		isbn: string,
		options?: Omit<FindOptions<BookAttributes>, 'where'>,
	): Promise<Book | null>;
	findByTitle(
		title: string,
		options?: Omit<FindOptions<BookAttributes>, 'where'>,
	): Promise<Book | null>;
	paginateBooks(
		currentPage: number,
		limit: number,
		order: Order,
		includeDeleted?: boolean,
		where?: WhereOptions<BookAttributes>,
	): Promise<PaginateResult<Book>>;
}
