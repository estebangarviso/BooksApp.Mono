import {
	BelongsToMany,
	Column,
	DataType,
	Default,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { BookGenre } from './book-genre.entity';
import { Book } from './book.entity';

@Table({
	tableName: 'genres',
	timestamps: true,
})
export class Genre extends Model<Genre> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Column({
		allowNull: false,
		type: DataType.STRING(100),
		unique: true,
	})
	name: string;

	@BelongsToMany(() => Book, () => BookGenre)
	books: Book[];
}
