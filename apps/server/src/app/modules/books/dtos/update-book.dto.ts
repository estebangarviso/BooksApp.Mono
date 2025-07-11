import { Type } from '@sinclair/typebox';
import { AjvDto } from '#libs/ajv';
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends AjvDto(Type.Partial(CreateBookDto.schema)) {}

// register DTO OpenApi schema to Swagger
UpdateBookDto.registerOpenApi();
