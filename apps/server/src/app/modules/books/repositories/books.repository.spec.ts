import { getModelToken } from '@nestjs/sequelize';
import { Test, type TestingModule } from '@nestjs/testing';
import { Author, Book, Genre, Publisher } from '#db';
import { Sequelize } from 'sequelize-typescript';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateBookDto } from '../dtos/create-book.dto';
import { BooksRepository } from './books.repository';

const mockBookModel = {
	create: vi.fn(),
	findAndCountAll: vi.fn(),
};
const mockAuthorModel = {
	findOrCreate: vi.fn(),
};
const mockPublisherModel = {
	findOrCreate: vi.fn(),
};
const mockGenreModel = {
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
			const createBookDto: typeof CreateBookDto.schema.static = {
				author: 'Test Author',
				availability: true,
				genres: ['Fiction', 'Sci-Fi'],
				imageUrl: 'http://example.com/image.jpg',
				isbn: '1234567890',
				price: 29.99,
				publisher: 'Test Publisher',
				title: 'Test Book',
			};

			const authorInstance = { id: 1, name: 'Test Author' };
			const publisherInstance = { id: 1, name: 'Test Publisher' };
			const genreInstances = [
				{ id: 1, name: 'Fiction' },
				{ id: 2, name: 'Sci-Fi' },
			];
			const bookInstance = {
				id: 'book-1',
				...createBookDto,
				$set: vi.fn().mockResolvedValue(null),
				authorId: authorInstance.id,
				publisherId: publisherInstance.id,
				reload: vi.fn().mockResolvedValue(this),
			};

			mockAuthorModel.findOrCreate.mockResolvedValue([authorInstance]);
			mockPublisherModel.findOrCreate.mockResolvedValue([
				publisherInstance,
			]);
			mockBookModel.create.mockResolvedValue(bookInstance);
			mockGenreModel.findOrCreate
				.mockResolvedValueOnce([genreInstances[0]])
				.mockResolvedValueOnce([genreInstances[1]]);

			const result = await repository.create(createBookDto);

			expect(mockSequelize.transaction).toHaveBeenCalledOnce();
			expect(mockAuthorModel.findOrCreate).toHaveBeenCalledWith({
				transaction: mockTransaction,
				where: { name: createBookDto.author },
			});
			expect(mockPublisherModel.findOrCreate).toHaveBeenCalledWith({
				transaction: mockTransaction,
				where: { name: createBookDto.publisher },
			});
			expect(mockBookModel.create).toHaveBeenCalled();
			expect(mockGenreModel.findOrCreate).toHaveBeenCalledTimes(2);
			expect(bookInstance.$set).toHaveBeenCalledWith(
				'genres',
				expect.any(Array),
				{ transaction: mockTransaction },
			);
			expect(bookInstance.reload).toHaveBeenCalledWith({
				include: [Author, Publisher, Genre],
				transaction: mockTransaction,
			});
			expect(result).toBe(bookInstance);
		});
	});

	describe('paginate', () => {
		it('should call super.paginate which should use model.findAndCountAll', async () => {
			const options = { limit: 10, offset: 0 };
			const expectedResult = {
				count: 1,
				rows: [{ id: '1', title: 'A Book' }],
			};
			mockBookModel.findAndCountAll.mockResolvedValue(expectedResult);

			const result = await repository.paginate(options);

			expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(options);
			expect(result).toStrictEqual(expectedResult);
		});
	});
});
