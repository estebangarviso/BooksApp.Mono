import { getModelToken } from '@nestjs/sequelize';
import { Test, type TestingModule } from '@nestjs/testing';
import { Author, Book, Genre, Publisher } from '#db';
import { Sequelize } from 'sequelize-typescript';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CreateBookDtoWithCreatorId } from '../dtos/create-book.dto';
import { type BookVo } from '../vos/book.vo.ts';
import { BooksRepository } from './books.repository';

const mockBookModel = {
	create: vi.fn(),
	findAll: vi.fn(),
	findAndCountAll: vi.fn(),
	save: vi.fn(),
};
const mockAuthorModel = {
	findOrCreate: vi.fn(),
};
const mockPublisherModel = {
	findOrCreate: vi.fn(),
};
const mockGenreModel = {
	findAll: vi.fn(),
	findOrCreate: vi.fn(),
};

const mockTransaction = {
	commit: vi.fn(),
	rollback: vi.fn(),
};
const mockSequelize = {
	transaction: vi.fn().mockImplementation((callback) => {
		return callback(mockTransaction);
	}),
};

describe('BooksRepository', () => {
	let repository: BooksRepository;

	beforeEach(async () => {
		vi.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BooksRepository,
				{ provide: getModelToken(Book), useValue: mockBookModel },
				{ provide: getModelToken(Author), useValue: mockAuthorModel },
				{
					provide: getModelToken(Publisher),
					useValue: mockPublisherModel,
				},
				{ provide: getModelToken(Genre), useValue: mockGenreModel },
				{ provide: Sequelize, useValue: mockSequelize },
			],
		}).compile();

		repository = module.get<BooksRepository>(BooksRepository);
	});

	it('should be defined', () => {
		expect(repository).toBeDefined();
	});

	describe('create', () => {
		it('should create a book with author, publisher, and genres within a transaction', async () => {
			const authorInstance = { id: 1, name: 'Test Author' };
			const publisherInstance = { id: 1, name: 'Test Publisher' };
			const genreInstances = [
				{ id: 1, name: 'Fiction' },
				{ id: 2, name: 'Sci-Fi' },
			];
			const mockBookInstance = {
				id: 'book-1',
				$set: vi.fn().mockResolvedValue(null),
				author: authorInstance,
				authorId: authorInstance.id,
				availability: true,
				genres: genreInstances,
				imageUrl: 'http://example.com/image.jpg',
				isbn: '1234567890',
				price: 29.99,
				publisher: publisherInstance,
				publisherId: publisherInstance.id,
				save: vi.fn(),
				title: 'Test Book',
			} as unknown as Book;
			const createBookDtoWithCreatorId: CreateBookDtoWithCreatorId = {
				authorName: mockBookInstance.author.name,
				availability: mockBookInstance.availability,
				creatorId: 'creator-1',
				genres: mockBookInstance.genres.map((genre) => genre.name),
				imageUrl: mockBookInstance.imageUrl,
				isbn: mockBookInstance.isbn,
				price: mockBookInstance.price,
				publisherName: mockBookInstance.publisher.name,
				title: mockBookInstance.title,
			};
			const expectedResult: BookVo = {
				id: mockBookInstance.id,
				authorName: mockBookInstance.author.name,
				availability: mockBookInstance.availability,
				genres: mockBookInstance.genres.map((genre) => genre.name),
				imageUrl: mockBookInstance.imageUrl,
				isbn: mockBookInstance.isbn,
				price: mockBookInstance.price,
				publisherName: mockBookInstance.publisher.name,
				title: mockBookInstance.title,
			};

			mockAuthorModel.findOrCreate.mockResolvedValue([authorInstance]);
			mockPublisherModel.findOrCreate.mockResolvedValue([
				publisherInstance,
			]);
			mockBookModel.create.mockResolvedValue(mockBookInstance);
			mockGenreModel.findAll.mockResolvedValue(genreInstances);
			vi.spyOn(mockBookInstance, '$set').mockResolvedValueOnce(null);
			vi.spyOn(mockBookInstance, 'save').mockResolvedValueOnce(
				mockBookInstance,
			);

			const result = await repository.createWithDetails(
				createBookDtoWithCreatorId,
			);

			expect(mockSequelize.transaction).toHaveBeenCalledOnce();
			expect(mockAuthorModel.findOrCreate).toHaveBeenCalledWith({
				transaction: mockTransaction,
				where: { name: createBookDtoWithCreatorId.authorName },
			});
			expect(mockPublisherModel.findOrCreate).toHaveBeenCalledWith({
				transaction: mockTransaction,
				where: { name: createBookDtoWithCreatorId.publisherName },
			});
			expect(mockBookModel.create).toHaveBeenCalled();
			expect(mockGenreModel.findAll).toHaveBeenCalled();
			expect(mockBookInstance.$set).toHaveBeenCalledWith(
				'genres',
				expect.any(Array),
				{ transaction: mockTransaction },
			);
			expect(mockBookInstance.save).toHaveBeenCalledWith({
				transaction: mockTransaction,
			});
			expect(result).toStrictEqual(expectedResult);
		});
	});

	describe('findAllForExport', () => {
		it('should create an async generator for books with author, publisher, and genres', async () => {
			const includeDeleted = true;
			const BATCH_SIZE = 100;

			const mockBooksPage1 = Array.from(
				{ length: BATCH_SIZE },
				(_, i) => ({
					id: `${i}`,
					title: `Book ${i}`,
				}),
			);
			const mockBooksPage2 = Array.from({ length: 50 }, (_, i) => ({
				id: `${i + BATCH_SIZE}`,
				title: `Book ${i + BATCH_SIZE}`,
			}));

			mockBookModel.findAll
				.mockResolvedValueOnce(mockBooksPage1)
				.mockResolvedValueOnce(mockBooksPage2)
				.mockResolvedValueOnce([]); // no more books

			const bookStream = repository.findAllForExport(includeDeleted);

			const yieldedBooks = [];
			for await (const book of bookStream) {
				yieldedBooks.push(book);
			}

			expect(yieldedBooks).toHaveLength(150);
			expect(yieldedBooks[0]).toStrictEqual(mockBooksPage1[0]);
			expect(yieldedBooks[149]).toStrictEqual(mockBooksPage2[49]);

			expect(mockBookModel.findAll).toHaveBeenCalledTimes(3);
			expect(mockBookModel.findAll).toHaveBeenCalledWith({
				paranoid: !includeDeleted,
				include: [Author, Publisher, Genre],
				limit: BATCH_SIZE,
				offset: 0,
				order: [['title', 'ASC']],
			});
			expect(mockBookModel.findAll).toHaveBeenCalledWith({
				paranoid: !includeDeleted,
				include: [Author, Publisher, Genre],
				limit: BATCH_SIZE,
				offset: BATCH_SIZE,
				order: [['title', 'ASC']],
			});
		});
	});
});
