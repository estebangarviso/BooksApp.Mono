import { Optional } from 'sequelize';
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
import { IDeletedAt, ITimestamps } from '../../common/interfaces';
import { Author } from './author.entity';
import { BookGenre } from './book-genre.entity';
import { Genre } from './genre.entity';
import { Publisher } from './publisher.entity';
import { User } from './user.entity';

export interface BookAttributes extends IDeletedAt, ITimestamps {
	id: string;
	authorId: string;
	availability: boolean;
	creatorId: string;
	price: number;
	publisherId: string;
	title: string;
	imageUrl?: string;
	isbn?: string;
}

export interface BookCreationAttributes
	extends Optional<
		BookAttributes,
		keyof IDeletedAt | keyof ITimestamps | 'id' | 'imageUrl' | 'isbn'
	> {}

@Table({
	paranoid: true, // enables soft deletes
	tableName: 'books',
	timestamps: true,
})
export class Book extends Model<BookAttributes, BookCreationAttributes> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Index
	@Column({ allowNull: true, type: DataType.STRING(13), unique: true })
	declare isbn?: string;

	@Index
	@Column({ allowNull: false, type: DataType.STRING })
	declare title: string;

	@Column({ allowNull: false, type: DataType.DECIMAL(10, 2) })
	declare price: number;

	@Column({ allowNull: false, defaultValue: true, type: DataType.BOOLEAN })
	declare availability: boolean;

	@Column({ allowNull: true, type: DataType.STRING(2048) })
	declare imageUrl?: string;

	@ForeignKey(() => Author)
	@Column(DataType.UUID)
	declare authorId: string;

	@ForeignKey(() => User)
	@Column(DataType.UUID)
	declare creatorId?: string;

	@BelongsTo(() => Author)
	declare author: Author;

	@ForeignKey(() => Publisher)
	@Column(DataType.UUID)
	declare publisherId: string;

	@BelongsTo(() => Publisher)
	declare publisher: Publisher;

	@BelongsToMany(() => Genre, () => BookGenre)
	declare genres: Genre[];

	@CreatedAt
	declare createdAt: Date;

	@UpdatedAt
	declare updatedAt: Date;

	@DeletedAt
	declare deletedAt?: Date;
}
