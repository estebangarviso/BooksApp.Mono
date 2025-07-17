import { type Book, type BookAttributes, type IBaseRepository } from '#db';
import { type TPage } from '#libs/ajv';
import {
	type Attributes,
	type CreateOptions,
	type FindOptions,
	type Order,
	type WhereOptions,
} from 'sequelize';
import { type CreateBookDtoWithCreatorId } from '../dtos/create-book.dto';
import { type UpdateBookDto } from '../dtos/update-book.dto.ts';
import type { BookVo } from '../vos/book.vo.ts';

export const BOOKS_REPOSITORY = 'BooksRepository';

// NOTE: IBooksRepository now inherits all the standard methods.
// We can add book-specific methods here if needed in the future.
export interface IBooksRepository extends IBaseRepository<Book> {
	findAllForExport(includeDeleted?: boolean): AsyncGenerator<Book>;
	createWithDetails(
		createBookDto: CreateBookDtoWithCreatorId,
		options?: CreateOptions<Attributes<Book>>,
	): Promise<BookVo>;
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
	): Promise<TPage<Book>>;
	updateWithDetails(
		id: string,
		updateBookDto: UpdateBookDto,
	): Promise<Book | null>;
}
