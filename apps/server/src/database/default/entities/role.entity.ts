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

export interface RoleAttributes {
	id: number;
	description: string;
	name: string;
}

export interface RoleCreationAttributes {
	description: string;
	name: string;
}

@Table({
	tableName: 'roles',
	timestamps: true,
})
export class Role extends Model<RoleAttributes, RoleCreationAttributes> {
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
	declare name: string;

	@Column({
		allowNull: false,
		type: DataType.STRING(255),
	})
	declare description: string;

	@HasMany(() => User)
	users: User[];

	@BelongsToMany(() => Permission, () => RolePermission)
	permissions: Permission[];
}
