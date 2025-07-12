import { Optional } from 'sequelize';
import {
	BelongsTo,
	Column,
	DataType,
	Default,
	ForeignKey,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { ITimestamps } from '../../common/interfaces';
import { User } from './user.entity';

export interface ProfileAttributes extends ITimestamps {
	id: string;
	userId: string;
	firstName?: string;
	lastName?: string;
}

export interface ProfileCreationAttributes
	extends Optional<
		ProfileAttributes,
		keyof ITimestamps | 'firstName' | 'id' | 'lastName'
	> {}

@Table({
	tableName: 'profiles',
	timestamps: true,
})
export class Profile extends Model<
	ProfileAttributes,
	ProfileCreationAttributes
> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Column({
		allowNull: true,
		type: DataType.STRING,
	})
	declare firstName: string;

	@Column({
		allowNull: true,
		type: DataType.STRING,
	})
	declare lastName: string;

	@ForeignKey(() => User)
	@Column({
		allowNull: false,
		type: DataType.UUID,
		unique: true,
	})
	declare userId: string;

	@BelongsTo(() => User)
	declare user: User;
}
