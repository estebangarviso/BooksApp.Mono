import {
	type CallHandler,
	type ExecutionContext,
	type NestInterceptor,
} from '@nestjs/common';
import { type Book } from '#db';
import { type TPage } from '#libs/ajv';
import { map, type Observable } from 'rxjs';
import { type BookPageDto } from '../dtos/book-page.dto';
import { BookVo } from '../vos/book.vo.ts';

export class SearchBooksInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		handler: CallHandler,
	): Observable<any> {
		return handler.handle().pipe(
			map((data) =>
				data.map((item: TPage<Book>) => {
					const res: BookPageDto = {
						...item,
						data: item.data.map((book) => {
							const input: BookVo = {
								id: book.id,
								authorName: book.author?.name,
								availability: book.availability,
								genres: book.genres.map((genre) => genre.name),
								imageUrl: book.imageUrl,
								isbn: book.isbn,
								price: book.price,
								publisherName: book.publisher?.name,
								title: book.title,
							};
							return BookVo.parseSchema(input);
						}),
					};
					return res;
				}),
			),
		);
	}
}
