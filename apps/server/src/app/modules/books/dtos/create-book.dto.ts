import { Type } from '@sinclair/typebox';

import { AjvDto } from '#libs/ajv';

export class CreateBookDto extends AjvDto({
	price: Type.Number({ description: 'Price of the book', example: 10.25 }),
	author: Type.String({
		description: 'Author of the book',
		example: 'F. Scott Fitzgerald',
	}),
	availability: Type.Optional(
		Type.Boolean({
			description: 'Availability of the book',
			example: true,
		}),
	),
	genres: Type.Array(Type.String(), {
		description: 'Genres of the book',
		example: ['Fiction', 'Classic'],
	}),
	imageUrl: Type.Optional(
		Type.String({
			description: 'Image URL of the book cover',
			example: 'http://example.com/cover.jpg',
		}),
	),
	isbn: Type.Optional(
		Type.String({
			description: 'ISBN of the book',
			example: '978-3-16-148410-0',
		}),
	),
	publisher: Type.String({
		description: 'Publisher of the book',
		example: "Charles Scribner's Sons",
	}),
	title: Type.String({
		description: 'Title of the book',
		example: 'The Great Gatsby',
	}),
}) {}

// register DTO OpenApi schema to Swagger
CreateBookDto.registerOpenApi();
