import {
	BelongsTo,
	BelongsToMany,
	Column,
	CreatedAt,
	DataType,
	Default,
	DeletedAt,
	ForeignKey,
	Index,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';
import { Author } from './author.entity';
import { BookGenre } from './book-genre.entity';
import { Genre } from './genre.entity';
import { Publisher } from './publisher.entity';

@Table({
	paranoid: true, // enables soft deletes
	tableName: 'books',
	timestamps: true,
})
export class Book extends Model<Book> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Index
	@Column({ allowNull: true, type: DataType.STRING(13), unique: true })
	isbn?: string;

	@Index
	@Column({ allowNull: false, type: DataType.STRING })
	title: string;

	@Column({ allowNull: false, type: DataType.DECIMAL(10, 2) })
	price: number;

	@Column({ allowNull: false, defaultValue: true, type: DataType.BOOLEAN })
	availability: boolean;

	@Column({ allowNull: true, type: DataType.STRING(2048) })
	imageUrl?: string;

	@ForeignKey(() => Author)
	@Column(DataType.UUID)
	authorId: string;

	@BelongsTo(() => Author)
	author: Author;

	@ForeignKey(() => Publisher)
	@Column(DataType.UUID)
	publisherId: string;

	@BelongsTo(() => Publisher)
	publisher: Publisher;

	@BelongsToMany(() => Genre, () => BookGenre)
	genres: Genre[];

	@CreatedAt
	declare createdAt: Date;

	@UpdatedAt
	declare updatedAt: Date;

	@DeletedAt
	declare deletedAt?: Date;
}
