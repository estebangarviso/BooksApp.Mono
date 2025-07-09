import {
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from 'sequelize-typescript';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Table({ tableName: 'role_permissions', timestamps: false })
export class RolePermission extends Model<RolePermission> {
	@ForeignKey(() => Role)
	@Column(DataType.INTEGER)
	roleId: number;

	@ForeignKey(() => Permission)
	@Column(DataType.INTEGER)
	permissionId: number;
}
