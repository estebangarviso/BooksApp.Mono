import {
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from 'sequelize-typescript';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

interface RolePermissionAttributes {
	permissionId: number;
	roleId: number;
}

export interface RolePermissionCreationAttributes
	extends Partial<RolePermissionAttributes> {}

@Table({ tableName: 'role_permissions', timestamps: false })
export class RolePermission extends Model<
	RolePermissionAttributes,
	RolePermissionCreationAttributes
> {
	@ForeignKey(() => Role)
	@Column(DataType.INTEGER)
	declare roleId: number;

	@ForeignKey(() => Permission)
	@Column(DataType.INTEGER)
	declare permissionId: number;
}
