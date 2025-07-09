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
import { User } from './user.entity';

@Table({
	tableName: 'profiles',
	timestamps: true,
})
export class Profile extends Model<Profile> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Column({
		allowNull: true,
		type: DataType.STRING,
	})
	firstName: string;

	@Column({
		allowNull: true,
		type: DataType.STRING,
	})
	lastName: string;

	@ForeignKey(() => User)
	@Column({
		allowNull: false,
		type: DataType.UUID,
		unique: true,
	})
	userId: string;

	@BelongsTo(() => User)
	user: User;
}
