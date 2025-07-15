import { Type } from '@sinclair/typebox';
import { AjvDto } from '#libs/ajv';

export class CreatedBookDto extends AjvDto({
	id: Type.String({
		description: 'Unique identifier of the book',
		example: '123e4567-e89b-12d3-a456-426614174000',
	}),
	authorName: Type.String({
		description: 'Name of the author',
		example: 'F. Scott Fitzgerald',
	}),
	availability: Type.Boolean({
		description: 'Availability status of the book',
		example: true,
	}),
	genres: Type.Array(
		Type.String({
			description: 'List of genres associated with the book',
			example: ['Fiction', 'Classic'],
		}),
	),
	imageUrl: Type.Optional(
		Type.String({
			description: 'URL of the book cover image',
			example: 'https://example.com/great-gatsby.jpg',
		}),
	),
	isbn: Type.Optional(
		Type.String({
			description: 'ISBN number of the book',
			example: '978-3-16-148410-0',
		}),
	),
	price: Type.Number({
		description: 'Price of the book',
		example: 19.99,
	}),
	publisherName: Type.String({
		description: 'Name of the publisher',
		example: 'Scribner',
	}),
	title: Type.String({
		description: 'Title of the book',
		example: 'The Great Gatsby',
	}),
}) {}

// register DTO OpenApi schema to Swagger
CreatedBookDto.registerOpenApi();
