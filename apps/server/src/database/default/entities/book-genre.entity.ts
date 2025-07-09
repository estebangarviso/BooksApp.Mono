import {
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from 'sequelize-typescript';
import { Book } from './book.entity';
import { Genre } from './genre.entity';

@Table({
	tableName: 'book_genres',
	timestamps: true,
})
export class BookGenre extends Model<BookGenre> {
	@ForeignKey(() => Book)
	@Column(DataType.UUID)
	bookId: string;

	@ForeignKey(() => Genre)
	@Column(DataType.UUID)
	genreId: string;
}
