import { env } from '#config';
import * as bcrypt from 'bcryptjs';
import { Optional } from 'sequelize';
import {
	BeforeCreate,
	BeforeUpdate,
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
import { ITimestamps } from '../../common/interfaces';
import { Profile } from './profile.entity';
import { Role } from './role.entity';

export interface UserAttributes extends ITimestamps {
	id: string;
	email: string;
	isActive: boolean;
	mustChangePassword: boolean;
	password: string;
	refreshToken: string | null;
	roleId: number;
	tokenVersion: number;
}

export interface UserCreationAttributes
	extends Optional<
		UserAttributes,
		| keyof ITimestamps
		| 'id'
		| 'isActive'
		| 'mustChangePassword'
		| 'refreshToken'
		| 'tokenVersion'
	> {}

@Table({
	tableName: 'users',
	timestamps: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@Column({
		allowNull: false,
		type: DataType.STRING(63),
		unique: true,
	})
	declare email: string;

	@Column({
		allowNull: false,
		type: DataType.STRING(64),
	})
	declare password: string;

	@Column({ defaultValue: true, type: DataType.BOOLEAN })
	declare mustChangePassword: boolean;

	@Column({ allowNull: false, defaultValue: true, type: DataType.BOOLEAN })
	declare isActive: boolean;

	@Column({ allowNull: false, defaultValue: 0, type: DataType.INTEGER })
	declare tokenVersion: number;

	@Column({ allowNull: true, defaultValue: null, type: DataType.STRING })
	declare refreshToken: string | null;

	@ForeignKey(() => Role)
	@Column(DataType.INTEGER)
	declare roleId: number;

	@BelongsTo(() => Role)
	declare role: Role;

	@HasOne(() => Profile)
	declare profile: Profile;

	/**
	 * Hashes the password before creating or updating the user.
	 * This method is called automatically by Sequelize before the create or update operations.
	 * It uses bcrypt to hash the password with a salt defined in the environment configuration.
	 * @param {User} instance - The user instance being created or updated.
	 */
	@BeforeCreate
	@BeforeUpdate
	static async hashPassword(instance: User) {
		if (!instance.changed('password')) return;
		const plainPassword = instance.getDataValue('password');
		const salt = await bcrypt.genSalt(env.APP.SECURITY.BCRYPT.SALT_ROUNDS);
		const hashedPassword = await bcrypt.hash(plainPassword, salt);
		instance.setDataValue('password', hashedPassword);
	}

	/**
	 * Checks if the user has access based on their active status and password change requirement.
	 * @returns {boolean} True if the user is active and does not require a password change, false otherwise.
	 */
	hasAccess(): boolean {
		return this.isActive && !this.mustChangePassword;
	}

	/**
	 * Compares the provided password with the stored hashed password.
	 * @param {string} password - The password to compare.
	 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
	 */
	comparePassword(password: string): Promise<boolean> {
		return bcrypt.compare(password, this.password);
	}

	/**
	 * Compares the provided refresh token with the stored hashed refresh token.
	 * @param {string} refreshToken - The refresh token to compare.
	 * @returns {Promise<boolean>} A promise that resolves to true if the tokens match, false otherwise.
	 */
	compareRefreshToken(refreshToken: string): Promise<boolean> {
		if (!this.refreshToken) return Promise.resolve(false);
		return bcrypt.compare(refreshToken, this.refreshToken);
	}

	/**
	 * Updates the user's refresh token.
	 *
	 * @description
	 * This method hashes the new refresh token before saving it to the database.
	 * If the provided refresh token is null, it clears the stored refresh token.
	 * It uses bcrypt to hash the refresh token with a salt defined in the environment configuration.
	 * @param {string | null} refreshToken - The new refresh token to set, or null to clear it.
	 * @returns {Promise<void>}
	 */
	async updateRefreshToken(refreshToken: string | null): Promise<void> {
		if (refreshToken === null) {
			this.refreshToken = null;
			await this.save();
			return;
		}
		const salt = await bcrypt.genSalt(env.APP.SECURITY.BCRYPT.SALT_ROUNDS);
		const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

		this.refreshToken = hashedRefreshToken;
		await this.save();
	}
}
