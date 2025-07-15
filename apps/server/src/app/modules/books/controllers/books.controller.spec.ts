import { Test, type TestingModule } from '@nestjs/testing';
import type { Book } from '#db';
import { AuthGuards } from '#libs/decorators';
import { stringify } from 'csv-stringify';
import type { FastifyReply } from 'fastify';
import { Readable } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CreateBookDto } from '../dtos/create-book.dto';
import { type PaginateBooksDto } from '../dtos/paginate-books.dto';
import { type UpdateBookDto } from '../dtos/update-book.dto';
import { BooksService } from '../services/books.service';
import { BooksController } from './books.controller';

const mockBooksService = {
	create: vi.fn(),
	findAllForExport: vi.fn(),
	findOne: vi.fn(),
	getBooksCsvStringifier: vi.fn(() => stringify({ header: true })),
	remove: vi.fn(),
	search: vi.fn(),
	update: vi.fn(),
};

const mockAccessTokenAuthGuard = {
	canActivate: vi.fn(() => true),
};

describe(BooksController.name, () => {
	let controller: BooksController;
	let service: BooksService;

	async function* bookStreamWithData(): AsyncGenerator<Book> {
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
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: BooksService,
					useValue: mockBooksService,
				},
			],
			controllers: [BooksController],
		})
			.overrideGuard(AuthGuards)
			.useValue(mockAccessTokenAuthGuard)
			.compile();

		controller = module.get<BooksController>(BooksController);
		service = module.get<BooksService>(BooksService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('create', () => {
		it('should create a book', async () => {
			const createBookDto: CreateBookDto = {
				author: 'Test Author',
				genres: ['Fiction', 'Adventure'],
				isbn: '1234567890',
				price: 19.99,
				publisher: 'Test Publisher',
				title: 'Test Book',
			};
			const expectedResult = { id: '1', ...createBookDto };
			mockBooksService.create.mockResolvedValue(expectedResult);

			const result = await controller.create(createBookDto);

			expect(service.create).toHaveBeenCalledWith(createBookDto);
			expect(result).toStrictEqual(expectedResult);
		});
	});

	describe('search', () => {
		it('should search for books', async () => {
			const paginateBooksDto: PaginateBooksDto = { limit: 10, page: 1 };
			const expectedResult = { data: [], total: 0 };
			mockBooksService.search.mockResolvedValue(expectedResult);

			const result = await controller.search(paginateBooksDto);

			expect(service.search).toHaveBeenCalledWith(paginateBooksDto);
			expect(result).toStrictEqual(expectedResult);
		});
	});

	describe('findAllForExport', () => {
		it('should export books to csv', async () => {
			const bookStream = bookStreamWithData();
			mockBooksService.findAllForExport.mockReturnValue(bookStream);

			const mockReply = {
				header: vi.fn(),
				send: vi.fn(),
			} as unknown as FastifyReply;

			const result = await controller.findAllForExport(mockReply);

			expect(service.findAllForExport).toHaveBeenCalled();
			expect(mockReply.header).toHaveBeenCalledTimes(1);
			expect(mockReply.header).toHaveBeenCalledWith(
				'Content-Disposition',
				expect.stringContaining('attachment; filename="books_'),
			);
			expect(mockReply.send).toHaveBeenCalled();
			expect(result).toBeUndefined();
		});
	});

	describe('findOne', () => {
		it('should find a book by id', async () => {
			const id = '1';
			const expectedResult = { id, title: 'Test Book' };
			mockBooksService.findOne.mockResolvedValue(expectedResult);

			const result = await controller.findOne(id);

			expect(service.findOne).toHaveBeenCalledWith(id);
			expect(result).toStrictEqual(expectedResult);
		});
	});

	describe('update', () => {
		it('should update a book', async () => {
			const id = '1';
			const updateBookDto: UpdateBookDto = { title: 'Updated Title' };
			const expectedResult = { id, ...updateBookDto };
			mockBooksService.update.mockResolvedValue(expectedResult);

			const result = await controller.update(id, updateBookDto);

			expect(service.update).toHaveBeenCalledWith(id, updateBookDto);
			expect(result).toStrictEqual(expectedResult);
		});
	});

	describe('remove', () => {
		it('should remove a book', async () => {
			const id = '1';
			const expectedResult = { id, title: 'Deleted Book' };
			mockBooksService.remove.mockResolvedValue(expectedResult);

			const result = await controller.remove(id);

			expect(service.remove).toHaveBeenCalledWith(id);
			expect(result).toStrictEqual(expectedResult);
		});
	});
});
