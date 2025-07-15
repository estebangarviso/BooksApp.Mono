import {
	type CallHandler,
	type ExecutionContext,
	type NestInterceptor,
} from '@nestjs/common';
import { type Book, type PaginateResult } from '#db';
import { map, type Observable } from 'rxjs';
import { PaginatedBookDto } from '../dtos/paginated-book.dto';

export class PaginateBooksInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		handler: CallHandler,
	): Observable<any> {
		return handler.handle().pipe(
			map((data) =>
				data.map((item: PaginateResult<Book>) => {
					const res: PaginateResult<
						typeof PaginatedBookDto.schema.static
					> = {
						...item,
						data: item.data.map((book) => {
							const input: typeof PaginatedBookDto.schema.static =
								{
									id: book.id,
									authorName: book.author?.name,
									availability: book.availability,
									imageUrl: book.imageUrl,
									isbn: book.isbn,
									price: book.price,
									publisherName: book.publisher?.name,
									title: book.title,
									genres: book.genres.map(
										(genre) => genre.name,
									),
								};
							return PaginatedBookDto.parseSchema(input);
						}),
					};
					return res;
				}),
			),
		);
	}
}
