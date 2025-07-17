import { type CallHandler, type ExecutionContext } from '@nestjs/common';
import { type Author, type Book, type Genre, type Publisher } from '#db';
import { type TPage } from '#libs/ajv';
import { lastValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { type BookVo } from '../vos/book.vo.ts';
import { SearchBooksInterceptor } from './search-books.interceptor';

describe(SearchBooksInterceptor.name, () => {
	let interceptor: SearchBooksInterceptor;

	beforeEach(() => {
		interceptor = new SearchBooksInterceptor();
	});

	it('should be defined', () => {
		expect(interceptor).toBeDefined();
	});

	it('should map PaginateResult<Book> to PaginateResult<PaginatedBookDto>', async () => {
		const mockBook: Book = {
			id: '1',
			author: { id: '1', name: 'Test Author' } as Author,
			availability: true,
			createdAt: new Date(),
			creatorId: 'creator-id',
			genres: [{ id: '1', name: 'Fiction' }] as Genre[],
			imageUrl: 'http://example.com/image.png',
			isbn: '978-3-16-148410-0',
			price: 29.99,
			publisher: { id: '1', name: 'Test Publisher' } as Publisher,
			title: 'Test Book',
			updatedAt: new Date(),
		} as Book;

		const paginatedResult: TPage<Book> = {
			currentPage: 1,
			data: [mockBook],
			hasMorePages: false,
			lastPage: 1,
			totalRecords: 1,
		};

		const mockExecutionContext = {} as ExecutionContext;
		const mockCallHandler: CallHandler = {
			handle: () => of([paginatedResult]), // the interceptor expects an array of PaginateResult
		};

		const result = (await lastValueFrom(
			interceptor.intercept(mockExecutionContext, mockCallHandler),
		)) as TPage<BookVo>[];

		const expectedDto: BookVo = {
			id: '1',
			authorName: 'Test Author',
			availability: true,
			genres: ['Fiction'],
			imageUrl: 'http://example.com/image.png',
			isbn: '978-3-16-148410-0',
			price: 29.99,
			publisherName: 'Test Publisher',
			title: 'Test Book',
		};

		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(1);
		const transformedResult = result[0];
		expect(transformedResult.data[0]).toStrictEqual(expectedDto);
		expect(transformedResult.totalRecords).toBe(
			paginatedResult.totalRecords,
		);
	});
});
