import { AppPermission } from '#libs/enums';
import { Optional } from 'sequelize';
import {
	BelongsToMany,
	Column,
	DataType,
	Model,
	Table,
} from 'sequelize-typescript';
import { RolePermission } from './role-permission.entity';
import { Role } from './role.entity';

interface PermissionAttributes {
	id: number;
	action: AppPermission;
	description?: string;
}

export interface PermissionCreationAttributes
	extends Optional<PermissionAttributes, 'description' | 'id'> {}

@Table({ tableName: 'permissions', timestamps: false })
export class Permission extends Model<
	PermissionAttributes,
	PermissionCreationAttributes
> {
	@Column({
		autoIncrement: true,
		primaryKey: true,
		type: DataType.INTEGER,
	})
	declare id: number;

	@Column({
		allowNull: false,
		type: DataType.ENUM(...Object.values(AppPermission)),
		unique: true,
	})
	declare action: AppPermission;

	@Column({
		allowNull: true,
		type: DataType.TEXT,
	})
	declare description: string;

	@BelongsToMany(() => Role, () => RolePermission)
	roles: Role[];
}
