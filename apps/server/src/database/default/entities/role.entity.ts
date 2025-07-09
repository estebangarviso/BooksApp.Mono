import {
	BelongsToMany,
	Column,
	DataType,
	HasMany,
	Model,
	Table,
} from 'sequelize-typescript';
import { Permission } from './permission.entity';
import { RolePermission } from './role-permission.entity';
import { User } from './user.entity';

@Table({
	tableName: 'roles',
	timestamps: true,
})
export class Role extends Model<Role> {
	@Column({
		autoIncrement: true,
		primaryKey: true,
		type: DataType.INTEGER,
	})
	declare id: number;

	@Column({
		allowNull: false,
		type: DataType.STRING(50),
		unique: true,
	})
	name: string;

	@HasMany(() => User)
	users: User[];

	@BelongsToMany(() => Permission, () => RolePermission)
	permissions: Permission[];
}
