import { Optional } from 'sequelize';
import {
	Column,
	DataType,
	Default,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { ITimestamps } from '../../common/interfaces';
import { Book } from './book.entity';

interface AuthorAttributes extends ITimestamps {
	id: string;
	name: string;
}

interface AuthorCreationAttributes
	extends Optional<AuthorAttributes, keyof ITimestamps | 'id'> {}

@Table({
	tableName: 'authors',
	timestamps: true,
})
export class Author extends Model<AuthorAttributes, AuthorCreationAttributes> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Column({
		allowNull: false,
		type: DataType.STRING,
		unique: true,
	})
	name: string;

	@HasMany(() => Book)
	books: Book[];
}
