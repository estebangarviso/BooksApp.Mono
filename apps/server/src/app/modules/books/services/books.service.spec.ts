import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { type Book } from '#db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CreateBookDto } from '../dtos/create-book.dto';
import {
	BOOKS_REPOSITORY,
	type IBooksRepository,
} from '../interfaces/books.repository.interface';
import { BooksService } from './books.service';

const mockBooksRepository: IBooksRepository = {
	count: vi.fn(),
	create: vi.fn(),
	findAll: vi.fn(),
	findOne: vi.fn(),
	paginate: vi.fn(),
	softDelete: vi.fn(),
	update: vi.fn(),
};

describe('BooksService', () => {
	let service: BooksService;
	let repository: IBooksRepository;

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

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should call repository.create with correct data', async () => {
			const createBookDto: typeof CreateBookDto.schema.static = {
				author: 'Author Name',
				genres: ['Fiction', 'Adventure'],
				isbn: '123',
				price: 9.99,
				publisher: 'Publisher Name',
				title: 'New Book',
			};
			const expectedBook = { id: '1', ...createBookDto };
			vi.spyOn(repository, 'create').mockResolvedValue(
				expectedBook as any,
			);

			const result = await service.create(createBookDto);

			expect(repository.create).toHaveBeenCalledWith(createBookDto);
			expect(result).toStrictEqual(expectedBook);
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
			vi.spyOn(repository, 'update').mockResolvedValue(
				updatedBook as any,
			);

			const result = await service.update(bookId, updateDto);

			expect(repository.update).toHaveBeenCalledWith(bookId, updateDto);
			expect(result).toStrictEqual(updatedBook);
		});

		it('should throw NotFoundException if book to update not found', async () => {
			const bookId = '1';
			const updateDto = { title: 'Updated Book' };
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
		it('should call repository.softDelete with correct id', async () => {
			const bookId = '1';
			vi.spyOn(repository, 'softDelete').mockResolvedValue();

			await service.remove(bookId);

			expect(repository.softDelete).toHaveBeenCalledWith(bookId);
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

		it('should throw NotFoundException if no books are found', async () => {
			const options = { limit: 10, page: 1 };
			vi.spyOn(repository, 'paginate').mockResolvedValue({
				count: 0,
				rows: [],
			});

			await expect(service.search(options)).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.search(options)).rejects.toThrow(
				'No books found matching the criteria.',
			);
		});
	});

	describe('exportToCsv', () => {
		const mockBook = {
			id: '1',
			author: { name: 'Test Author' },
			availability: true,
			genres: [{ name: 'Fiction' }, { name: 'Adventure' }],
			isbn: '1234567890',
			price: 19.99,
			publisher: { name: 'Test Publisher' },
			title: 'Test Book',
			toFixed: vi.fn(),
		} as unknown as Book;

		it('should export books to CSV', async () => {
			vi.spyOn(repository, 'count').mockResolvedValue(1);
			vi.spyOn(repository, 'paginate').mockResolvedValue({
				count: 1,
				rows: [mockBook],
			});

			const generator = service.exportToCsv();
			const headers = await generator.next();
			const row1 = await generator.next();
			const done = await generator.next();

			expect(headers.value).toContain(
				'ID,ISBN,Title,Author,Publisher,Genres,Price,Availability',
			);
			expect(row1.value).toContain(
				'1,1234567890,Test Book,Test Author,Test Publisher,"Fiction; Adventure",19.99,Available',
			);
			expect(done.done).toBe(true);
		});

		it('should handle pagination when exporting to CSV', async () => {
			const booksPage1 = Array.from({ length: 100 }).fill(mockBook);
			const booksPage2 = Array.from({ length: 50 }).fill(mockBook);
			vi.spyOn(repository, 'count').mockResolvedValue(150);
			vi.spyOn(repository, 'paginate')
				.mockResolvedValueOnce({ count: 150, rows: booksPage1 as any })
				.mockResolvedValueOnce({ count: 150, rows: booksPage2 as any });

			const generator = service.exportToCsv();
			const results = [];
			for await (const value of generator) {
				results.push(value);
			}

			expect(results).toHaveLength(151); // 1 header + 150 rows
			expect(repository.paginate).toHaveBeenCalledTimes(2);
		});

		it('should throw NotFoundException if no books to export', async () => {
			vi.spyOn(repository, 'count').mockResolvedValue(0);

			const generator = service.exportToCsv();
			await expect(generator.next()).rejects.toThrow(NotFoundException);
			await expect(generator.next()).rejects.toThrow(
				'No books found to export.',
			);
		});
	});

	describe('_escapeCsvField', () => {
		it('should escape fields with commas', () => {
			const result = (service as any)._escapeCsvField(
				'field, with comma',
			);
			expect(result).toBe('"field, with comma"');
		});

		it('should escape fields with double quotes', () => {
			const result = (service as any)._escapeCsvField(
				'field with "quote"',
			);
			expect(result).toBe('"field with ""quote"""');
		});

		it('should not escape fields without special characters', () => {
			const result = (service as any)._escapeCsvField('simple field');
			expect(result).toBe('simple field');
		});
	});

	describe('_transformBookToCsvRow', () => {
		it('should transform a book to a CSV row', () => {
			const book = {
				id: '1',
				author: { name: 'Author Name' },
				availability: true,
				genres: [{ name: 'Genre1' }, { name: 'Genre2' }],
				isbn: '123-456',
				price: 9.99,
				publisher: { name: 'Publisher Name' },
				title: 'A Book Title',
				toFixed: vi.fn(),
			} as unknown as Book;

			const result = (service as any)._transformBookToCsvRow(book);
			expect(result).toBe(
				'1,123-456,A Book Title,Author Name,Publisher Name,"Genre1; Genre2",9.99,Available\n',
			);
		});
	});
});
