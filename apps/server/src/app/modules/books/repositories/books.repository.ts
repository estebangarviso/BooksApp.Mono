import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Author, BaseRepository, Book, Genre, Publisher } from '#db';
import { CreationAttributes, FindOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { IBooksRepository } from '../interfaces/books.repository.interface';
import { type TCreateBookDto } from '../schemas/create-book.dto';

@Injectable()
export class BooksRepository
	extends BaseRepository<Book>
	implements IBooksRepository
{
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
	create(createBookDto: TCreateBookDto): Promise<Book> {
		return this.sequelize.transaction(async (t) => {
			const [author] = await this.authorModel.findOrCreate({
				transaction: t,
				where: { name: createBookDto.author },
			});

			const [publisher] = await this.publisherModel.findOrCreate({
				transaction: t,
				where: { name: createBookDto.publisher },
			});

			const bookAttributes: CreationAttributes<Book> = {
				authorId: author.id,
				availability: createBookDto.availability,
				imageUrl: createBookDto.imageUrl,
				isbn: createBookDto.isbn,
				price: createBookDto.price,
				publisherId: publisher.id,
				title: createBookDto.title,
			} as CreationAttributes<Book>;
			const book = await this.bookModel.create(bookAttributes, {
				transaction: t,
			});

			if (createBookDto.genres && createBookDto.genres.length > 0) {
				const genreInstances = await Promise.all(
					createBookDto.genres.map((genreName) =>
						this.genreModel
							.findOrCreate({
								transaction: t,
								where: { name: genreName },
							})
							.then(([genre]) => genre),
					),
				);
				await book.$set('genres', genreInstances, { transaction: t });
			}

			return book.reload({
				include: [Author, Publisher, Genre],
				transaction: t,
			});
		});
	}
	paginate(
		options?: FindOptions<Book> | undefined,
	): Promise<{ count: number; rows: Book[] }> {
		return super.paginate(options);
	}
}
