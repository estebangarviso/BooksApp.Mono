import { Optional } from 'sequelize';
import {
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from 'sequelize-typescript';
import { ITimestamps } from '../../common/interfaces';
import { Book } from './book.entity';
import { Genre } from './genre.entity';

export interface BookGenreAttributes extends ITimestamps {
	bookId: string;
	genreId: string;
}

export interface BookGenreCreationAttributes
	extends Optional<BookGenreAttributes, keyof ITimestamps> {}

@Table({
	tableName: 'book_genres',
	timestamps: true,
})
export class BookGenre extends Model<
	BookGenreAttributes,
	BookGenreCreationAttributes
> {
	@ForeignKey(() => Book)
	@Column(DataType.UUID)
	bookId: string;

	@ForeignKey(() => Genre)
	@Column(DataType.UUID)
	genreId: string;
}
