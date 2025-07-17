import { AjvPageDto } from '#libs/ajv';
import { BookVo } from '../vos/book.vo.ts';

export class BookPageDto extends AjvPageDto(BookVo.schema, {
	description: 'Paginated result of books',
	examples: [
		{
			id: '123e4567-e89b-12d3-a456-426614174000',
			authorName: 'F. Scott Fitzgerald',
			availability: true,
			genres: ['Fiction', 'Classic'],
			imageUrl: 'https://example.com/great-gatsby.jpg',
			isbn: '978-3-16-148410-0',
			price: 19.99,
			publisherName: 'Scribner',
			title: 'The Great Gatsby',
		} satisfies typeof BookVo.schema.static,
	],
}) {}

// register DTO OpenApi schema to Swagger
BookPageDto.registerOpenApi();
