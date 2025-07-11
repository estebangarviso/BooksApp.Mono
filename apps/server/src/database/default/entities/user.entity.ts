import { env } from '#config';
import * as bcrypt from 'bcryptjs';
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
		type: DataType.STRING(63),
		unique: true,
	})
	email: string;

	@Column({
		allowNull: false,
		type: DataType.STRING(64),
	})
	password: string;

	@Column({ allowNull: false, defaultValue: 0, type: DataType.INTEGER })
	tokenVersion: number;

	@Column({ allowNull: true, type: DataType.STRING })
	@Default(null)
	refreshToken: string | null;

	@ForeignKey(() => Role)
	@Column(DataType.INTEGER)
	roleId: number;

	@BelongsTo(() => Role)
	role: Role;

	@HasOne(() => Profile)
	profile: Profile;

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
		const salt = await bcrypt.genSalt(env.APP.SECURITY.BCRYPT.SALT_ROUNDS);
		const hashedRefreshToken = refreshToken
			? await bcrypt.hash(refreshToken, salt)
			: null;
		this.refreshToken = hashedRefreshToken;
		await this.save();
	}
}
