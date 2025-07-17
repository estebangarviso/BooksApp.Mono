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

export interface PublisherAttributes extends ITimestamps {
	id: string;
	name: string;
}

export interface PublisherCreationAttributes
	extends Optional<PublisherAttributes, keyof ITimestamps | 'id'> {}

@Table({
	tableName: 'publishers',
	timestamps: true,
})
export class Publisher extends Model<
	PublisherAttributes,
	PublisherCreationAttributes
> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Column({
		allowNull: false,
		type: DataType.STRING,
		unique: true,
	})
	declare name: string;

	@HasMany(() => Book)
	declare books: Book[];
}
