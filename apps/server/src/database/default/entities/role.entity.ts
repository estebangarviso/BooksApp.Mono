import { AppRole } from '#libs/enums';
import { Optional } from 'sequelize';
import {
	BelongsToMany,
	Column,
	DataType,
	HasMany,
	Model,
	Table,
} from 'sequelize-typescript';
import { ITimestamps } from '../../common/interfaces';
import { Permission } from './permission.entity';
import { RolePermission } from './role-permission.entity';
import { User } from './user.entity';

export interface RoleAttributes extends ITimestamps {
	id: number;
	description: string;
	name: AppRole;
}

export interface RoleCreationAttributes
	extends Optional<RoleAttributes, keyof ITimestamps | 'id'> {}

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
		defaultValue: AppRole.GUEST,
		type: DataType.ENUM(...Object.values(AppRole)),
		unique: true,
	})
	declare name: AppRole;

	@Column({
		allowNull: false,
		type: DataType.STRING(255),
	})
	declare description: string;

	@HasMany(() => User)
	declare users: User[];

	@BelongsToMany(() => Permission, () => RolePermission)
	declare permissions: Permission[];
}
