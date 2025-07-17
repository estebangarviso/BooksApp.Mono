import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Book, BookAttributes } from '#db';
import { TPage } from '#libs/ajv';
import { stringify } from 'csv-stringify';
import { Op, Order, WhereOptions } from 'sequelize';
import { CreateBookDtoWithCreatorId } from '../dtos/create-book.dto';
import { FindBooksQueryDto } from '../dtos/find-books-query.dto.ts';
import { UpdateBookDto } from '../dtos/update-book.dto';
import {
	BOOKS_REPOSITORY,
	type IBooksRepository,
} from '../interfaces/books.repository.interface';
import { isIsbn } from '../utils/type-validators.util';
import type { BookVo } from '../vos/book.vo.ts';

@Injectable()
export class BooksService {
	constructor(
		@Inject(BOOKS_REPOSITORY)
		private readonly booksRepository: IBooksRepository,
	) {}

	/**
	 * Creates a new book with the provided details.
	 * The repository handles the complex creation logic, including author and publisher creation.
	 * @param createBookDtoWithCreatorId - The DTO containing book details.
	 * @returns The created book instance.
	 */
	async create(
		createBookDtoWithCreatorId: CreateBookDtoWithCreatorId,
	): Promise<BookVo> {
		const { isbn, title } = createBookDtoWithCreatorId;
		if (title) {
			const existingBook = await this.booksRepository.findByTitle(title);
			if (existingBook) {
				throw new BadRequestException(
					`Book with title "${title}" already exists`,
				);
			}
		} else if (isbn) {
			const existingBook = await this.booksRepository.findByIsbn(isbn);
			if (existingBook) {
				throw new BadRequestException(
					`Book with ISBN ${isbn} already exists`,
				);
			}
		}
		// the repository now handles the complex creation logic.
		return this.booksRepository.createWithDetails(
			createBookDtoWithCreatorId,
		);
	}

	/**
	 * Find a book by its ID.
	 * @param id - The ID of the book to find.
	 * @returns The book instance if found.
	 * @throws {NotFoundException} if the book with the given ID does not exist.
	 */
	async findOne(id: string) {
		const book = await this.booksRepository.findOne(id);
		if (!book) {
			throw new NotFoundException(`Book with ID "${id}" not found`);
		}
		return book;
	}

	/**
	 * Updates a book by its ID with the provided details.
	 * The repository's update method needs to be enhanced to handle relations.
	 * @param bookId - The ID of the book to update.
	 * @param updateBookDto - The DTO containing the updated book details.
	 * @returns The updated book instance.
	 * @throws {NotFoundException} if the book with the given ID does not exist.
	 */
	async update(bookId: string, updateBookDto: UpdateBookDto) {
		const { isbn, title } = updateBookDto;
		if (title) {
			const existingBook = await this.booksRepository.findByTitle(title);
			if (existingBook && existingBook.id !== bookId) {
				throw new BadRequestException(
					`Book with title "${title}" already exists`,
				);
			}
		} else if (isbn) {
			const existingBook = await this.booksRepository.findByIsbn(isbn);
			if (existingBook && existingBook.id !== bookId) {
				throw new BadRequestException(
					`Book with ISBN ${isbn} already exists`,
				);
			}
		}
		// the repository now handles the complex update logic.
		const book = await this.booksRepository.updateWithDetails(
			bookId,
			updateBookDto,
		);
		if (!book) {
			throw new NotFoundException(`Book with ID "${bookId}" not found`);
		}
		return book;
	}

	/**
	 * Soft deletes a book by its ID.
	 * This method marks the book as deleted without removing it from the database.
	 * @param bookId - The ID of the book to soft delete.
	 * @returns A promise that resolves when the book is soft deleted.
	 * @throws {NotFoundException} if the book with the given ID does not exist.
	 */
	remove(bookId: string) {
		return this.booksRepository.delete(bookId);
	}

	/**
	 * Finds books with pagination, filtering, and sorting options.
	 *
	 * @param options - Pagination and filtering options.
	 * @returns A promise that resolves to an object containing the count of books and the rows of books.
	 * @example
	 * ```typescript
	 * const result = await booksService.search({
	 *   includeDeleted: false,
	 *   limit: 20,
	 *   page: 1,
	 *   search: 'Harry Potter',
	 *   sortBy: 'title',
	 *   sortOrder: 'asc',
	 * });
	 * console.log(result.count); // Total number of books found matching the criteria
	 * console.log(result.rows); // Array of Book instances
	 * ```
	 *
	 * @throws {NotFoundException} if no books are found.
	 */
	async search(options?: FindBooksQueryDto): Promise<TPage<Book>> {
		const {
			includeDeleted = false,
			limit = 10,
			page: currentPage = 1,
			search = '',
			sortBy = 'title',
			sortOrder = 'asc',
		} = options || {};
		const order: Order = [[sortBy, sortOrder.toUpperCase()]];
		const isValidFilled =
			typeof search === 'string' && search.trim().length > 0;
		if (!isValidFilled) {
			throw new BadRequestException(
				'Search term must be a non-empty string.',
			);
		}
		const isValidIsbn = isIsbn(search);

		const where: WhereOptions<BookAttributes> = isValidIsbn
			? { isbn: search }
			: {
					[Op.or]: [
						{ title: { [Op.iLike]: `%${search}%` } },
						{ '$author.name$': { [Op.iLike]: `%${search}%` } },
						{
							'$publisher.name$': {
								[Op.iLike]: `%${search}%`,
							},
						},
					],
				};
		const result = await this.booksRepository.paginateBooks(
			currentPage,
			limit,
			order,
			includeDeleted,
			where,
		);

		if (result.totalRecords === 0) {
			throw new NotFoundException(
				'No books found matching the criteria.',
			);
		}

		return result;
	}

	/**
	 * Streams books for CSV export.
	 * This method generates a CSV stream of books, including their details and relations.
	 * @param includeDeleted - If true, includes soft-deleted books in the export.
	 * @returns An async generator that yields CSV rows.
	 * @throws {NotFoundException} if no books are found to export.
	 */
	findAllForExport(includeDeleted: boolean = false): AsyncGenerator<Book> {
		return this.booksRepository.findAllForExport(includeDeleted);
	}

	/**
	 * Returns a CSV stringifier for books.
	 * This method provides a stringifier configured for book data, including relations.
	 * @returns A CSV stringifier instance.
	 */
	getBooksCsvStringifier() {
		// define the CSV columns and their headers.
		const columns = [
			{ header: 'ID', key: 'id' },
			{ header: 'ISBN', key: 'isbn' },
			{ header: 'Title', key: 'title' },
			{ header: 'Author', key: 'author.name' },
			{ header: 'Publisher', key: 'publisher.name' },
			{ header: 'Genres', key: 'genres' },
			{ header: 'Price', key: 'price' },
			{ header: 'Availability', key: 'availability' },
		];

		// create a CSV stringifier with the defined columns.
		return stringify({
			columns,
			header: true,
			cast: {
				object: (value) => {
					if (Array.isArray(value)) {
						return value.map((v) => v.name).join('; ');
					}
					return JSON.stringify(value);
				},
			},
		});
	}
}
