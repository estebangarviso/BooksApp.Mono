import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Book } from '#db';
import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type CreateBookDto } from '../dtos/create-book.dto';
import {
	BOOKS_REPOSITORY,
	type IBooksRepository,
} from '../interfaces/books.repository.interface';
import { BooksService } from './books.service';

const mockBooksRepository: IBooksRepository = {
	count: vi.fn(),
	create: vi.fn(),
	createWithDetails: vi.fn(),
	delete: vi.fn(),
	findAll: vi.fn(),
	findAllForExport: vi.fn(),
	findAndCountAll: vi.fn(),
	findByIsbn: vi.fn(),
	findByTitle: vi.fn(),
	findOne: vi.fn(),
	paginate: vi.fn(),
	update: vi.fn(),
};

describe('BooksService', () => {
	let service: BooksService;
	let repository: IBooksRepository;

	const asyncGeneratorDataStreamBookToCsvWithData: AsyncGenerator<Book> =
		(async function* () {
			yield {
				id: '1',
				author: { name: 'Test Author' },
				availability: true,
				genres: [{ name: 'Fiction' }, { name: 'Adventure' }],
				isbn: '1234567890',
				price: 19.99,
				publisher: { name: 'Test Publisher' },
				title: 'Test Book',
			} as Book;
		})();

	const booksStreamGenerator: AsyncGenerator<Book> =
		(async function* () {})();

	beforeEach(async () => {
		vi.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BooksService,
				{
					provide: BOOKS_REPOSITORY,
					useValue: mockBooksRepository,
				},
			],
		}).compile();

		service = module.get<BooksService>(BooksService);
		repository = module.get<IBooksRepository>(BOOKS_REPOSITORY);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should call repository.createWithDetails with correct data', async () => {
			const createBookDto: typeof CreateBookDto.schema.static = {
				authorName: 'Author Name',
				availability: true,
				genres: ['Fiction', 'Adventure'],
				imageUrl: 'http://example.com/image.jpg',
				isbn: '123',
				price: 9.99,
				publisherName: 'Publisher Name',
				title: 'New Book',
			};
			const expectedBook = { id: '1', ...createBookDto };
			vi.spyOn(repository, 'findByTitle').mockResolvedValue(null);
			vi.spyOn(repository, 'findByIsbn').mockResolvedValue(null);
			vi.spyOn(repository, 'createWithDetails').mockResolvedValue(
				expectedBook as any,
			);

			const result = await service.create(createBookDto);

			expect(repository.createWithDetails).toHaveBeenCalledWith(
				createBookDto,
			);
			expect(result).toStrictEqual(expectedBook);
		});

		it('should throw BadRequestException if book with same title exists', async () => {
			const createBookDto = { title: 'Existing Book' };
			vi.spyOn(repository, 'findByTitle').mockResolvedValue({
				id: '2',
			} as any);

			await expect(service.create(createBookDto as any)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should throw BadRequestException if book with same ISBN exists', async () => {
			const createBookDto = { isbn: '12345' };
			vi.spyOn(repository, 'findByIsbn').mockResolvedValue({
				id: '2',
			} as any);

			await expect(service.create(createBookDto as any)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe('findOne', () => {
		it('should return a book if found', async () => {
			const bookId = '1';
			const expectedBook = { id: bookId, title: 'Found Book' };
			vi.spyOn(repository, 'findOne').mockResolvedValue(
				expectedBook as any,
			);

			const result = await service.findOne(bookId);

			expect(repository.findOne).toHaveBeenCalledWith(bookId);
			expect(result).toStrictEqual(expectedBook);
		});

		it('should throw NotFoundException if book not found', async () => {
			const bookId = '1';
			vi.spyOn(repository, 'findOne').mockResolvedValue(null);

			await expect(service.findOne(bookId)).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.findOne(bookId)).rejects.toThrow(
				`Book with ID "${bookId}" not found`,
			);
		});
	});

	describe('update', () => {
		it('should update and return a book', async () => {
			const bookId = '1';
			const updateDto = { title: 'Updated Book' };
			const updatedBook = { id: bookId, ...updateDto };
			vi.spyOn(repository, 'findByTitle').mockResolvedValue(null);
			vi.spyOn(repository, 'update').mockResolvedValue(
				updatedBook as any,
			);

			const result = await service.update(bookId, updateDto);

			expect(repository.update).toHaveBeenCalledWith(bookId, updateDto);
			expect(result).toStrictEqual(updatedBook);
		});

		it('should not throw BadRequestException if updating book with its own title', async () => {
			const bookId = '1';
			const updateDto = { title: 'Existing Title' };
			vi.spyOn(repository, 'findByTitle').mockResolvedValue({
				id: bookId,
			} as any); // same ID
			vi.spyOn(repository, 'update').mockResolvedValue({
				id: bookId,
				...updateDto,
			} as any);

			await expect(
				service.update(bookId, updateDto),
			).resolves.toBeDefined();
		});

		it('should throw BadRequestException if another book has the same title', async () => {
			const bookId = '1';
			const updateDto = { title: 'Existing Title' };
			vi.spyOn(repository, 'findByTitle').mockResolvedValue({
				id: '2',
			} as any);

			await expect(service.update(bookId, updateDto)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should throw BadRequestException if another book has the same ISBN', async () => {
			const bookId = '1';
			const updateDto = { isbn: '12345' };
			vi.spyOn(repository, 'findByIsbn').mockResolvedValue({
				id: '2',
			} as any);

			await expect(service.update(bookId, updateDto)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should throw NotFoundException if book to update not found', async () => {
			const bookId = '1';
			const updateDto = { title: 'Updated Book' };
			vi.spyOn(repository, 'findByTitle').mockResolvedValue(null);
			vi.spyOn(repository, 'update').mockResolvedValue(null);

			await expect(service.update(bookId, updateDto)).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.update(bookId, updateDto)).rejects.toThrow(
				`Book with ID "${bookId}" not found`,
			);
		});
	});

	describe('remove', () => {
		it('should call repository.delete with correct id', async () => {
			const bookId = '1';
			vi.spyOn(repository, 'delete').mockResolvedValue();

			await service.remove(bookId);

			expect(repository.delete).toHaveBeenCalledWith(bookId);
		});
	});

	describe('search', () => {
		it('should return paginated books', async () => {
			const options = { limit: 10, page: 1, search: 'test' };
			const paginatedResult = {
				count: 1,
				rows: [{ id: '1', title: 'Test Book' }],
			};
			vi.spyOn(repository, 'paginate').mockResolvedValue(
				paginatedResult as any,
			);

			const result = await service.search(options);

			expect(repository.paginate).toHaveBeenCalled();
			expect(result).toStrictEqual({
				count: paginatedResult.count,
				rows: paginatedResult.rows,
			});
		});

		it('should throw BadRequestException if search term is empty', async () => {
			const options = { limit: 10, page: 1, search: ' ' };
			await expect(service.search(options)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should throw NotFoundException if no books are found', async () => {
			const options = { limit: 10, page: 1, search: 'nonexistent' };
			vi.spyOn(repository, 'paginate').mockResolvedValue({
				count: 0,
				rows: [],
				totalRecords: 0,
			} as any);

			await expect(service.search(options)).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.search(options)).rejects.toThrow(
				'No books found matching the criteria.',
			);
		});
	});

	describe('findAllForExport', () => {
		it('should call repository.findAllForExport', () => {
			vi.spyOn(repository, 'findAllForExport').mockReturnValue(
				asyncGeneratorDataStreamBookToCsvWithData,
			);
			const includeDeleted = true;
			const generator = service.findAllForExport(includeDeleted);
			expect(repository.findAllForExport).toHaveBeenCalledWith(
				includeDeleted,
			);
			expect(generator).toBeDefined();
		});

		it('should get an empty generator if no books to export', async () => {
			vi.spyOn(repository, 'findAllForExport').mockReturnValue(
				booksStreamGenerator,
			);
			vi.spyOn(repository, 'count').mockResolvedValue(0);

			const generator = service.findAllForExport();
			const nextValue = await generator.next();

			expect(nextValue.done).toBe(true);
			expect(nextValue.value).toBeUndefined();
		});
	});

	describe('getBooksCsvStringifier', () => {
		it('should return a CSV stringifier', () => {
			const stringifier = service.getBooksCsvStringifier();

			// check if the stringifier is a writable stream
			expect(stringifier).toBeDefined();
			expect(stringifier.writable).toBe(true);
		});

		it('should properly format book data into CSV', async () => {
			const stringifier = service.getBooksCsvStringifier();
			const outputStream = new PassThrough();

			// sample book data
			const bookData = {
				id: '1234',
				author: { name: 'Test Author' },
				availability: 'In Stock',
				genres: [{ name: 'Fiction' }, { name: 'Drama' }],
				isbn: '9781234567890',
				price: 19.99,
				publisher: { name: 'Test Publisher' },
				title: 'Test Book',
			};

			// collect output from the stringifier
			let csvOutput = '';
			outputStream.on('data', (chunk) => {
				csvOutput += chunk.toString();
			});

			// pipe the stringifier to our output stream
			stringifier.pipe(outputStream);

			// write the data and end the stream
			stringifier.write(bookData);
			stringifier.end();

			// wait for the stream to finish
			await new Promise((resolve) => outputStream.on('end', resolve));

			// check headers are present
			expect(csvOutput).toContain(
				'ID,ISBN,Title,Author,Publisher,Genres,Price,Availability',
			);

			// check actual data is present
			expect(csvOutput).toContain('1234');
			expect(csvOutput).toContain('9781234567890');
			expect(csvOutput).toContain('Test Book');
			expect(csvOutput).toContain('Test Author');
			expect(csvOutput).toContain('Test Publisher');
			expect(csvOutput).toContain('Fiction; Drama'); // genres should be semicolon-separated
			expect(csvOutput).toContain('19.99');
			expect(csvOutput).toContain('In Stock');
		});

		it('should properly handle empty arrays', async () => {
			const stringifier = service.getBooksCsvStringifier();
			const outputStream = new PassThrough();

			const bookData = {
				id: '5678',
				author: { name: 'Another Author' },
				availability: 'Out of Stock',
				genres: [], // empty array
				isbn: '9780987654321',
				price: 29.99,
				publisher: { name: 'Another Publisher' },
				title: 'Another Book',
			};

			let csvOutput = '';
			outputStream.on('data', (chunk) => {
				csvOutput += chunk.toString();
			});

			stringifier.pipe(outputStream);
			stringifier.write(bookData);
			stringifier.end();

			await new Promise((resolve) => outputStream.on('end', resolve));

			// empty genres array should be formatted as an empty string or properly handled
			expect(csvOutput).toContain('5678');
			expect(csvOutput).toContain('Another Book');
			expect(csvOutput).not.toContain('undefined');
		});

		it('should properly handle complex objects', async () => {
			const stringifier = service.getBooksCsvStringifier();
			const outputStream = new PassThrough();

			const bookData = {
				id: '9012',
				additionalInfo: { pages: 400, year: 2023 },
				availability: 'Pre-order',
				genres: [{ description: 'Scientific topics', name: 'Science' }],
				isbn: '9781122334455',
				price: 39.99,
				title: 'Complex Book',
				author: {
					bio: 'Author bio text',
					name: 'Complex Author',
				},
				publisher: {
					location: 'New York',
					name: 'Complex Publisher',
				},
			};

			let csvOutput = '';
			outputStream.on('data', (chunk) => {
				csvOutput += chunk.toString();
			});

			stringifier.pipe(outputStream);
			stringifier.write(bookData);
			stringifier.end();

			await new Promise((resolve) => outputStream.on('end', resolve));

			// check that complex nested objects are properly stringified
			expect(csvOutput).toContain('Complex Author');
			expect(csvOutput).toContain('Complex Publisher');
			expect(csvOutput).toContain('Science');
			expect(csvOutput).toContain('39.99');
		});
	});
});
