import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Res,
	UseGuards,
} from '@nestjs/common';
import { type FastifyReply } from 'fastify';
import { AuthenticationBasedAccessGuard } from '../../../../libs/guards/abac.guard';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator';
import { CreateBookDto } from '../dtos/create-book.dto';
import { PaginateBooksDto } from '../dtos/paginate-books.dto';
import { UpdateBookDto } from '../dtos/update-book.dto';
import { BooksService } from '../services/books.service';
import { BooksControllerDocs } from './books.controller.docs';

@ApplyControllerDocs(BooksControllerDocs)
@UseGuards(AuthenticationBasedAccessGuard)
@Controller('books')
export class BooksController {
	constructor(private readonly _booksService: BooksService) {}

	@Post()
	create(@Body() createBookDto: CreateBookDto) {
		return this._booksService.create(
			createBookDto as typeof CreateBookDto.schema.static,
		);
	}

	@Get()
	search(@Query() paginateBooksDto: PaginateBooksDto) {
		return this._booksService.search(paginateBooksDto);
	}

	@Get('export/csv')
	exportToCsv(@Res({ passthrough: true }) reply: FastifyReply) {
		const csvStream = this._booksService.exportToCsv();
		const now = new Date().toISOString();
		void reply.header('Content-Type', 'text/csv');
		void reply.header(
			'Content-Disposition',
			`attachment; filename="books_${now}.csv"`,
		);

		// fastify's reply.send() can handle async iterators directly.
		return reply.send(csvStream);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this._booksService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
		return this._booksService.update(id, updateBookDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this._booksService.remove(id);
	}
}
