import * as bcrypt from 'bcryptjs';
import {
	BeforeCreate,
	BelongsTo,
	Column,
	DataType,
	Default,
	ForeignKey,
	HasOne,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { Profile } from './profile.entity';
import { Role } from './role.entity';

@Table({
	tableName: 'users',
	timestamps: true,
})
export class User extends Model<User> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Column({
		allowNull: false,
		type: DataType.STRING(100),
		unique: true,
	})
	username: string;

	@Column({
		allowNull: false,
		type: DataType.STRING(255),
		unique: true,
	})
	email: string;

	@Column({
		allowNull: false,
		type: DataType.STRING(255),
	})
	password: string;

	@Column({ allowNull: false, defaultValue: 0, type: DataType.INTEGER })
	tokenVersion: number;

	@ForeignKey(() => Role)
	@Column(DataType.INTEGER)
	roleId: number;

	@BelongsTo(() => Role)
	role: Role;

	@HasOne(() => Profile)
	profile: Profile;

	@BeforeCreate
	static async hashPassword(instance: User) {
		if (instance.password) {
			const salt = await bcrypt.genSalt(10);
			// hash the password before saving it to the database
			instance.password = await bcrypt.hash(instance.password, salt);
		}
	}
}
