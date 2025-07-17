import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	Author,
	BaseRepository,
	Book,
	BookAttributes,
	Genre,
	Publisher,
} from '#db';
import { TPage } from '#libs/ajv';
import {
	CreationAttributes,
	FindOptions,
	Order,
	Transaction,
	WhereOptions,
} from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateBookDtoWithCreatorId } from '../dtos/create-book.dto.ts';
import { UpdateBookDto } from '../dtos/update-book.dto.ts';
import { IBooksRepository } from '../interfaces/books.repository.interface';
import { BookVo } from '../vos/book.vo.ts';

@Injectable()
export class BooksRepository
	extends BaseRepository<Book>
	implements IBooksRepository
{
	findByIsbn(
		isbn: string,
		options?: Omit<FindOptions<BookAttributes>, 'where'>,
	): Promise<Book | null> {
		return this.bookModel.findOne({
			...options,
			where: { isbn },
		});
	}
	findByTitle(
		title: string,
		options?: Omit<FindOptions<BookAttributes>, 'where'>,
	): Promise<Book | null> {
		return this.bookModel.findOne({
			...options,
			where: { title },
		});
	}
	constructor(
		@InjectModel(Book) private readonly bookModel: typeof Book,
		@InjectModel(Author) private readonly authorModel: typeof Author,
		@InjectModel(Publisher)
		private readonly publisherModel: typeof Publisher,
		@InjectModel(Genre) private readonly genreModel: typeof Genre,
		private readonly sequelize: Sequelize,
	) {
		super(bookModel);
	}

	/**
	 * Creates a new book with the provided details.
	 * If the author or publisher does not exist, it will be created.
	 * Genres will also be created if they do not exist.
	 *
	 * @param createBookDto - The DTO containing book details.
	 * @returns The created book instance with related entities.
	 */
	createWithDetails(
		createBookDto: CreateBookDtoWithCreatorId,
	): Promise<BookVo> {
		return this.sequelize.transaction(async (t) => {
			const author = await this._findOrCreateAuthor(
				createBookDto.authorName,
				t,
			);

			const publisher = await this._findOrCreatePublisher(
				createBookDto.publisherName,
				t,
			);

			const bookAttributes: CreationAttributes<Book> = {
				authorId: author.id,
				availability: true,
				creatorId: createBookDto.creatorId,
				imageUrl: createBookDto.imageUrl,
				isbn: createBookDto.isbn,
				price: createBookDto.price,
				publisherId: publisher.id,
				title: createBookDto.title,
			};
			const createdBook = await this.bookModel.create(bookAttributes, {
				include: [Author, Publisher, Genre],
				transaction: t,
			});

			if (createBookDto.genres && createBookDto.genres.length > 0) {
				const genreInstances = await this._findOrCreateGenres(
					createBookDto.genres,
					t,
				);
				await createdBook.$set('genres', genreInstances, {
					transaction: t,
				});
			}
			const savedBook = await createdBook.save({ transaction: t });
			return {
				id: savedBook.id,
				authorName: savedBook.author.name,
				availability: savedBook.availability,
				genres: savedBook.genres.map((genre) => genre.name),
				imageUrl: savedBook.imageUrl,
				isbn: savedBook.isbn,
				price: savedBook.price,
				publisherName: savedBook.publisher.name,
				title: savedBook.title,
			};
		});
	}

	findAllForExport(includeDeleted: boolean): AsyncGenerator<Book> {
		const BATCH_SIZE = 100;
		let offset = 0;

		const asyncGenerator = async function* (this: BooksRepository) {
			while (true) {
				const books = await this.bookModel.findAll({
					paranoid: !includeDeleted,
					include: [Author, Publisher, Genre],
					limit: BATCH_SIZE,
					offset,
					order: [['title', 'ASC']],
				});

				if (books.length === 0) {
					break;
				}

				for (const book of books) {
					yield book;
				}

				offset += BATCH_SIZE;
			}
		}.bind(this);

		return asyncGenerator();
	}

	/**
	 * Paginates books based on the provided criteria.
	 * This method supports searching by title, author, or ISBN.
	 * It returns a paginated result with books and their details.
	 *
	 * @param currentPage - The current page number (1-based).
	 * @param limit - The number of records per page.
	 * @param order - The order in which to sort the results.
	 * @param includeDeleted - Whether to include soft-deleted books.
	 * @param orArray - Additional conditions to apply in the search.
	 * @returns A paginated result containing books and their details.
	 * @throws {BadRequestException} if currentPage or limit is less than 1.
	 * @throws {NotFoundException} if no books are found matching the criteria.
	 * @throws {Error} if an unexpected error occurs during pagination.
	 *
	 * @example
	 * const result = await booksRepository.paginateBooks(1, 10, [['title', 'ASC']]);
	 * console.log(result);
	 * // Output: PaginatedResult<Book> with books sorted by title in ascending order.
	 */
	paginateBooks(
		currentPage: number,
		limit: number,
		order: Order,
		includeDeleted = false,
		where: WhereOptions<BookAttributes> = {},
	): Promise<TPage<Book>> {
		if (currentPage < 1)
			throw new BadRequestException(
				'Current page must be greater than 0',
			);
		if (limit < 1)
			throw new BadRequestException('Limit must be greater than 0');

		return this.paginate(currentPage, limit, {
			paranoid: includeDeleted,
			include: [Author, Publisher, Genre],
			order,
			where,
			attributes: [
				'id',
				'isbn',
				'title',
				['$author.name$', 'authorName'],
				['$publisher.name$', 'publisherName'],
				'price',
				'availability',
				'imageUrl',
				['$genres.name$', 'genres'],
			],
		});
	}

	updateWithDetails(
		id: string,
		updateBookDto: UpdateBookDto,
	): Promise<Book | null> {
		return this.sequelize.transaction(async (t) => {
			const foundBook = await this.bookModel.findByPk(id, {
				include: [Author, Publisher, Genre],
				transaction: t,
			});
			if (!foundBook) return null;

			const { authorName, genres, publisherName } = updateBookDto;

			if (authorName) {
				const author = await this._findOrCreateAuthor(authorName, t);
				foundBook.authorId = author.id;
			}

			if (publisherName) {
				const publisher = await this._findOrCreatePublisher(
					publisherName,
					t,
				);
				foundBook.publisherId = publisher.id;
			}

			if (genres && genres.length > 0) {
				const genreInstances = await this._findOrCreateGenres(
					genres,
					t,
				);
				await foundBook.$set('genres', genreInstances, {
					transaction: t,
				});
			}

			const {
				authorName: _authorName,
				genres: _genres,
				publisherName: _publisherName,
				...bookAttributes
			} = updateBookDto;

			return this.update(id, bookAttributes as BookAttributes);
		});
	}

	private async _findOrCreateAuthor(
		name: string,
		transaction: Transaction,
	): Promise<Author> {
		const [author] = await this.authorModel.findOrCreate({
			transaction,
			where: { name },
		});

		return author;
	}

	private async _findOrCreatePublisher(
		name: string,
		transaction: Transaction,
	): Promise<Publisher> {
		const [publisher] = await this.publisherModel.findOrCreate({
			transaction,
			where: { name },
		});

		return publisher;
	}

	private async _findOrCreateGenres(
		names: string[],
		transaction: Transaction,
	): Promise<Genre[]> {
		const existingGenres = await this.genreModel.findAll({
			transaction,
			where: { name: names },
		});

		const existingGenreNames = new Set(existingGenres.map((g) => g.name));
		const newGenres = names
			.filter((name) => !existingGenreNames.has(name))
			.map((name) => ({ name }));

		if (newGenres.length > 0) {
			const createdGenres = await this.genreModel.bulkCreate(newGenres, {
				transaction,
			});
			return [...existingGenres, ...createdGenres];
		}

		return existingGenres;
	}
}
