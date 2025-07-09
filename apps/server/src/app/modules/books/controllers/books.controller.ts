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
import type { FastifyReply } from 'fastify';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { type TCreateBookDto } from '../schemas/create-book.dto';
import { type TPaginateBooksDto } from '../schemas/paginate-books.dto';
import { type TUpdateBookDto } from '../schemas/update-book.dto';
import { BooksService } from '../services/books.service';
import { BooksControllerDocs } from './books.controller.docs';

@ApplyControllerDocs(BooksControllerDocs)
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BooksController {
	constructor(private readonly booksService: BooksService) {}

	@Post()
	create(@Body() createBookDto: TCreateBookDto) {
		return this.booksService.create(createBookDto);
	}

	@Get()
	search(@Query() paginateBooksDto: TPaginateBooksDto) {
		return this.booksService.search(paginateBooksDto);
	}

	@Get('export/csv')
	exportToCsv(@Res({ passthrough: true }) reply: FastifyReply) {
		const csvStream = this.booksService.exportToCsv();
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
		return this.booksService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateBookDto: TUpdateBookDto) {
		return this.booksService.update(id, updateBookDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.booksService.remove(id);
	}
}
