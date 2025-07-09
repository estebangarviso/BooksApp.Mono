import {
	BelongsToMany,
	Column,
	DataType,
	Model,
	Table,
} from 'sequelize-typescript';
import { RolePermission } from './role-permission.entity';
import { Role } from './role.entity';

@Table({ tableName: 'permissions', timestamps: false })
export class Permission extends Model<Permission> {
	@Column({
		autoIncrement: true,
		primaryKey: true,
		type: DataType.INTEGER,
	})
	declare id: number;

	@Column({
		allowNull: false,
		type: DataType.STRING(100),
		unique: true,
	})
	action: string;

	@Column({
		allowNull: true,
		type: DataType.TEXT,
	})
	description: string;

	@BelongsToMany(() => Role, () => RolePermission)
	roles: Role[];
}
