import { Optional } from 'sequelize';
import {
	BelongsToMany,
	Column,
	DataType,
	Default,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { ITimestamps } from '../../common/interfaces';
import { BookGenre } from './book-genre.entity';
import { Book } from './book.entity';

export interface GenreAttributes extends ITimestamps {
	id: string;
	name: string;
}

export interface GenreCreationAttributes
	extends Optional<GenreAttributes, keyof ITimestamps | 'id'> {}

@Table({
	tableName: 'genres',
	timestamps: true,
})
export class Genre extends Model<GenreAttributes, GenreCreationAttributes> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Column({
		allowNull: false,
		type: DataType.STRING(100),
		unique: true,
	})
	declare name: string;

	@BelongsToMany(() => Book, () => BookGenre)
	declare books: Book[];
}
