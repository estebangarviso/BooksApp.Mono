import {
	Column,
	DataType,
	Default,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { Book } from './book.entity';

@Table({
	tableName: 'authors',
	timestamps: true,
})
export class Author extends Model<Author> {
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
