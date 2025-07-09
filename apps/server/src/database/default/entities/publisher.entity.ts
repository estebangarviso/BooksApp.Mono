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
	tableName: 'publishers',
	timestamps: true,
})
export class Publisher extends Model<Publisher> {
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
