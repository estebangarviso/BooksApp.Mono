import { Type } from '@sinclair/typebox';
import { AjvDto } from '#libs/ajv';
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends AjvDto(Type.Partial(CreateBookDto.schema)) {}

export type TUpdateBookDto = Partial<typeof CreateBookDto.schema.static>;

UpdateBookDto.registerOpenApi();
