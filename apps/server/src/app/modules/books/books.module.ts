import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Author, Book, Genre, Publisher } from '#db';
import { BooksController } from './controllers/books.controller';
import { BOOKS_REPOSITORY } from './interfaces/books.repository.interface';
import { BooksRepository } from './repositories/books.repository';
import { BooksService } from './services/books.service';

@Module({
	providers: [
		BooksService,
		{
			provide: BOOKS_REPOSITORY,
			useClass: BooksRepository,
		},
	],
	controllers: [BooksController],
	imports: [SequelizeModule.forFeature([Book, Author, Publisher, Genre])],
})
export class BooksModule {}
