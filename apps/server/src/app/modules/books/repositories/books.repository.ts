import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	Author,
	BaseRepository,
	Book,
	BookAttributes,
	Genre,
	Publisher,
} from '#db';
import {
	Attributes,
	CreateOptions,
	CreationAttributes,
	FindOptions,
} from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import type { C } from 'vitest/dist/chunks/environment.d.cL3nLXbE.js';
import { CreateBookDto } from '../dtos/create-book.dto';
import type { PaginatedBookDto } from '../dtos/paginated-book.dto.ts';
import { IBooksRepository } from '../interfaces/books.repository.interface';

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
		createBookDto: CreateBookDto,
	): Promise<typeof PaginatedBookDto.schema.static> {
		return this.sequelize.transaction(async (t) => {
			const {
				authorName,
				availability,
				genres,
				imageUrl,
				isbn,
				price,
				publisherName,
				title,
			} = createBookDto as typeof CreateBookDto.schema.static;
			const [author] = await this.authorModel.findOrCreate({
				transaction: t,
				where: { name: authorName },
			});

			const [publisher] = await this.publisherModel.findOrCreate({
				transaction: t,
				where: { name: publisherName },
			});

			const bookAttributes: CreationAttributes<Book> = {
				authorId: author.id,
				availability,
				imageUrl,
				isbn,
				price,
				publisherId: publisher.id,
				title,
			} as CreationAttributes<Book>;
			const createdBook = await this.bookModel.create(bookAttributes, {
				transaction: t,
				include: [
					{
						attributes: ['name'],
						model: Author,
					},
					{
						attributes: ['name'],
						model: Publisher,
					},
					{
						attributes: ['name'],
						model: Genre,
					},
				],
			});

			if (genres && genres.length > 0) {
				const genreInstances = await Promise.all(
					genres.map((genreName) =>
						this.genreModel
							.findOrCreate({
								transaction: t,
								where: { name: genreName },
							})
							.then(([genre]) => genre),
					),
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
			} satisfies typeof PaginatedBookDto.schema.static;
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
}
