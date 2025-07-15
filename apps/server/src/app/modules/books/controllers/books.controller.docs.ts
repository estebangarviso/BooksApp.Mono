import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiProduces,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { type DecoratorsLookUp } from '#libs/decorators';
import { HttpStatusCode } from '#libs/http';
import { CreateBookDto } from '../dtos/create-book.dto.ts';
import { PaginateBooksDto } from '../dtos/paginate-books.dto.ts';
import { UpdateBookDto } from '../dtos/update-book.dto.ts';
import { type BooksController } from './books.controller.ts';

export const BooksControllerDocs: DecoratorsLookUp<BooksController> = {
	class: [ApiTags('Books'), ApiBearerAuth()],
	common: {
		method: [
			ApiResponse({
				description: 'Internal error',
				status: 500,
			}),
		],
	},
	method: {
		create: [
			ApiOperation({ summary: 'Create a new book' }),
			ApiBody({ schema: CreateBookDto.refObj }),
			ApiResponse({
				description: 'Book created successfully',
				schema: CreateBookDto.refObj,
				status: HttpStatusCode.CREATED,
			}),
		],
		findOne: [
			ApiOperation({ summary: 'Get a single book by ID' }),
			ApiResponse({
				description: 'Book found successfully',
				schema: CreateBookDto.refObj,
				status: HttpStatusCode.OK,
			}),
			ApiResponse({
				description: 'Book not found',
				status: HttpStatusCode.NOT_FOUND,
			}),
		],
		remove: [
			ApiOperation({ summary: 'Soft delete a book by ID' }),
			ApiResponse({
				description: 'Book soft deleted successfully',
				status: HttpStatusCode.NO_CONTENT,
			}),
		],
		search: [
			ApiOperation({ summary: 'Search for books' }),
			ApiQuery({
				schema: PaginateBooksDto.refObj,
			}),
			ApiResponse({
				description: 'List of books found',
				status: HttpStatusCode.OK,
				schema: {
					items: CreateBookDto.refObj,
					type: 'array',
				},
			}),
			ApiResponse({
				description: 'No books found',
				status: HttpStatusCode.NOT_FOUND,
			}),
		],
		findAllForExport: [
			ApiOperation({ summary: 'Export all books to a CSV file' }),
			ApiProduces('text/csv'),
			ApiResponse({
				description: 'CSV file containing all books',
				status: HttpStatusCode.OK,
			}),
			ApiResponse({
				description: 'No books found',
				status: HttpStatusCode.NOT_FOUND,
			}),
		],
		update: [
			ApiOperation({ summary: 'Update a book by ID' }),
			ApiBody({ schema: UpdateBookDto.refObj }),
			ApiParam({
				description: 'ID of the book to update',
				name: 'id',
				schema: { type: 'string' },
			}),
			ApiResponse({
				description: 'Book updated successfully',
				schema: CreateBookDto.refObj,
				status: HttpStatusCode.OK,
			}),
			ApiResponse({
				description: 'Book not found',
				status: HttpStatusCode.NOT_FOUND,
			}),
		],
	},
};
