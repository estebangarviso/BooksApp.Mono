import {
	Body,
	Controller,
	Delete,
	Get,
	Header,
	Param,
	Patch,
	Post,
	Query,
	Res,
	UseInterceptors,
} from '@nestjs/common';
import { Book } from '#db';
import { TPage } from '#libs/ajv';
import {
	AuthGuards,
	GetCurrentUserId,
	RequiredPermissions,
	RequiredRoles,
} from '#libs/decorators';
import { AppPermission, AppRole } from '#libs/enums';
import { type FastifyReply } from 'fastify';
import { Readable } from 'node:stream';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator';
import { CreateBookDto } from '../dtos/create-book.dto';
import { FindBooksQueryDto } from '../dtos/find-books-query.dto.ts';
import { UpdateBookDto } from '../dtos/update-book.dto';
import { SearchBooksInterceptor } from '../interceptors/search-books.interceptor.ts';
import { BooksService } from '../services/books.service';
import { type BookVo } from '../vos/book.vo.ts';
import { BooksControllerDocs } from './books.controller.docs';

@ApplyControllerDocs(BooksControllerDocs)
@AuthGuards()
@Controller('books')
export class BooksController {
	constructor(private readonly _booksService: BooksService) {}

	@Post()
	@RequiredPermissions(AppPermission.BOOKS_CREATE)
	create(
		@Body() createBookDto: CreateBookDto,
		@GetCurrentUserId() userId: string,
	): Promise<BookVo> {
		return this._booksService.create({
			...createBookDto,
			creatorId: userId,
		});
	}

	@Get()
	@RequiredPermissions(AppPermission.BOOKS_READ)
	@UseInterceptors(SearchBooksInterceptor)
	searchBooks(
		@Query() paginateBooksDto: FindBooksQueryDto,
	): Promise<TPage<Book>> {
		return this._booksService.search(paginateBooksDto);
	}

	@RequiredRoles(AppRole.ADMIN)
	@Header('Content-Type', 'text/csv')
	@Get('export/csv')
	async findAllForExport(@Res({ passthrough: true }) reply: FastifyReply) {
		// this creates a async generator that yields books for CSV export.
		const bookStream = this._booksService.findAllForExport();
		const stringifier = this._booksService.getBooksCsvStringifier();

		const now = new Date().toISOString();

		// set the content disposition header for CSV download.
		await reply.header(
			'Content-Disposition',
			`attachment; filename="books_${now}.csv"`,
		);

		// convert the async generator to a readable stream and pipe it to the CSV stringifier.
		const readable = Readable.from(bookStream);
		return reply.send(readable.pipe(stringifier));
	}

	@Get(':id')
	@RequiredPermissions(AppPermission.BOOKS_READ)
	findOne(@Param('id') id: string): Promise<Book> {
		return this._booksService.findOne(id);
	}

	@Patch(':id')
	@RequiredPermissions(AppPermission.BOOKS_UPDATE)
	update(
		@Param('id') id: string,
		@Body() updateBookDto: UpdateBookDto,
	): Promise<Book> {
		return this._booksService.update(id, updateBookDto);
	}

	@Delete(':id')
	@RequiredPermissions(AppPermission.BOOKS_DELETE)
	remove(@Param('id') id: string): Promise<void> {
		return this._booksService.remove(id);
	}
}
