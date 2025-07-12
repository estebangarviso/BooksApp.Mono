import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Book } from '#db';
import { Op } from 'sequelize';
import { CreateBookDto } from '../dtos/create-book.dto';
import { PaginateBooksDto } from '../dtos/paginate-books.dto';
import { UpdateBookDto } from '../dtos/update-book.dto';
import {
	BOOKS_REPOSITORY,
	type IBooksRepository,
} from '../interfaces/books.repository.interface';
import { isIsbn } from '../utils/type-validators.util';

@Injectable()
export class BooksService {
	constructor(
		@Inject(BOOKS_REPOSITORY)
		private readonly booksRepository: IBooksRepository,
	) {}

	/**
	 * Creates a new book with the provided details.
	 * The repository handles the complex creation logic, including author and publisher creation.
	 * @param createBookDto - The DTO containing book details.
	 * @returns The created book instance.
	 */
	create(createBookDto: typeof CreateBookDto.schema.static) {
		// the repository now handles the complex creation logic.
		return this.booksRepository.create(createBookDto);
	}

	/**
	 * Find a book by its ID.
	 * @param id - The ID of the book to find.
	 * @returns The book instance if found.
	 * @throws NotFoundException if the book with the given ID does not exist.
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
	 * @throws NotFoundException if the book with the given ID does not exist.
	 */
	async update(bookId: string, updateBookDto: UpdateBookDto) {
		// TODO: The repository's update method needs to be enhanced to handle relations.
		const book = await this.booksRepository.update(bookId, updateBookDto);
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
	 * @throws NotFoundException if the book with the given ID does not exist.
	 */
	remove(bookId: string) {
		return this.booksRepository.softDelete(bookId);
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
	 * @throws NotFoundException if no books are found.
	 */
	async search(
		options?: typeof PaginateBooksDto.schema.static,
	): Promise<{ count: number; rows: Book[] }> {
		const {
			includeDeleted = false,
			limit = 10,
			page = 1,
			search = '',
			sortBy = 'title',
			sortOrder = 'asc',
		} = options || {};
		const orArray: { [key: string]: any }[] = [];
		const isValidFilled =
			typeof search === 'string' && search.trim().length > 0;
		if (!isValidFilled) {
			throw new BadRequestException(
				'Search term must be a non-empty string.',
			);
		}
		const isValidIsbn = isIsbn(search);

		if (isValidIsbn) {
			// exact match for ISBN
			orArray.push({ isbn: search });
		} else {
			// search by title, author name, or publisher name
			orArray.push(
				{ title: { [Op.iLike]: `%${search}%` } },
				{ '$author.name$': { [Op.iLike]: `%${search}%` } },
				{
					'$publisher.name$': {
						[Op.iLike]: `%${search}%`,
					},
				},
			);
		}
		const result = await this.booksRepository.paginate({
			paranoid: !includeDeleted,
			include: ['author', 'publisher', 'genres'],
			limit,
			offset: (page - 1) * limit,
			order: [[sortBy, sortOrder.toUpperCase()]],
			where: {
				[Op.or]: orArray,
			},
		});

		if (result.count === 0) {
			throw new NotFoundException(
				'No books found matching the criteria.',
			);
		}

		return {
			count: result.count,
			rows: result.rows,
		};
	}

	/**
	 * Exports books to a CSV format.
	 * This method generates a CSV stream of books, including their details and relations.
	 * @param includeDeleted - If true, includes soft-deleted books in the export.
	 * @returns An async generator that yields CSV rows.
	 * @throws {NotFoundException} if no books are found to export.
	 */
	async *exportToCsv(
		includeDeleted: boolean = false,
	): AsyncGenerator<string> {
		// count the total number of books, including deleted ones if specified
		const total = await this.booksRepository.count({
			paranoid: !includeDeleted,
		});
		if (total === 0) {
			throw new NotFoundException('No books found to export.');
		}
		const headers = [
			'ID',
			'ISBN',
			'Title',
			'Author',
			'Publisher',
			'Genres',
			'Price',
			'Availability',
		].join(',');

		yield `${headers}\n`;

		// limit the number of books to 100 per iteration
		let offset = 0;
		const limit = 100;

		if (total > limit) {
			// while there are still books to process
			while (offset < total) {
				// paginate through the books
				const books = await this.booksRepository.paginate({
					paranoid: !includeDeleted,
					include: ['author', 'publisher', 'genres'],
					limit,
					offset,
				});

				// iterate through the books and format them as CSV rows
				for (const book of books.rows) {
					yield this._transformBookToCsvRow(book);
				}
				offset += limit;
			}

			// if we reach here, we have processed all books
			return;
		}

		const books = await this.booksRepository.paginate({
			paranoid: !includeDeleted,
			include: ['author', 'publisher', 'genres'],
			limit,
			offset: 0,
		});

		for (const book of books.rows) {
			yield this._transformBookToCsvRow(book);
		}
	}

	/**
	 * Escapes a field for CSV format. If the field contains a comma,
	 * double-quote, or newline, it will be enclosed in double-quotes.
	 * Existing double-quotes are escaped by doubling them.
	 *
	 * @param field - The field to escape.
	 * @example
	 * ```typescript
	 * const escapedField = this._escapeCsvField('Hello, "World"');
	 * console.log(escapedField); // Outputs: "Hello, ""World"""
	 * ```
	 * @private
	 * @description This method is used internally to ensure that CSV fields are properly formatted
	 * to avoid issues with CSV parsers when fields contain special characters.
	 * It is not intended to be used outside of this service.
	 * @throws {TypeError} if the field is not a string or cannot be converted to a string.
	 * @returns {string} The escaped field ready for CSV output.
	 * @see https://tools.ietf.org/html/rfc4180#section-2 for CSV format specifications.
	 * @see https://stackoverflow.com/questions/1293147/how-to-escape-double-quotes-in-csv for escaping double quotes in CSV.
	 */
	private _escapeCsvField(field: any): string {
		const str = String(field ?? '');
		if (/[\n",]/u.test(str)) {
			return `"${str.replaceAll('"', '""')}"`;
		}
		return str;
	}

	/**
	 * Transform a Book instance to a CSV row string.
	 * This method formats the book's properties into a CSV-compatible string.
	 * @param book - The Book instance to convert.
	 * @returns A string representing the book in CSV format.
	 */
	private _transformBookToCsvRow(book: Book): string {
		const genres = book.genres.map((g) => g.name).join('; ');
		const row = [
			book.id,
			book.isbn ?? 'N/A',
			book.title,
			book.author?.name ?? 'Unknown',
			book.publisher?.name ?? 'Unknown',
			genres,
			book.price.toFixed(2),
			book.availability ? 'Available' : 'Unavailable',
		]
			.map(this._escapeCsvField)
			.join(',');

		return `${row}\n`;
	}
}
