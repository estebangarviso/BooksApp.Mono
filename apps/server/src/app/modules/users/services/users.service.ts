import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { env } from '#config';
import { Profile, Role, User, UserAttributes } from '#db';
import { FindOptions, Op } from 'sequelize';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PaginateUsersDto } from '../dtos/paginate-users.dto';
import {
	type IUsersRepository,
	USERS_REPOSITORY,
} from '../interfaces/users.repository.interface';
import { UserVo } from '../vos/user.vo';

@Injectable()
export class UsersService {
	constructor(
		@Inject(USERS_REPOSITORY)
		private readonly usersRepository: IUsersRepository,
	) {}

	findOneByEmail(email: string): Promise<User | null> {
		return this.usersRepository.findOneByEmail(email);
	}

	findOneById(id: string): Promise<User | null> {
		return this.usersRepository.findOne(id);
	}

	findOneWithPermissions(id: string): Promise<User | null> {
		return this.usersRepository.findOneWithPermissions(id);
	}

	async updateRefreshToken(
		userId: string,
		refreshToken: string | null,
	): Promise<void> {
		const user = await this.findOneById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		await user.updateRefreshToken(refreshToken);
	}

	async incrementTokenVersion(userId: string): Promise<void> {
		const user = await this.findOneById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		user.tokenVersion += 1;
		await user.save();
	}

	async createUserWithDetails(createUserDto: CreateUserDto): Promise<User> {
		try {
			const existingUser = await this.usersRepository.findOneByEmail(
				createUserDto.email,
			);
			if (existingUser) {
				throw new BadRequestException(
					`User with email ${createUserDto.email} already exists`,
				);
			}
			const role = await this.usersRepository.findRoleByRoleId(
				createUserDto.roleId,
			);
			if (!role) throw new BadRequestException('Role not found');

			return await this.usersRepository.createUserWithDetails({
				email: createUserDto.email,
				password: this._generateRandomPassword(),
				roleId: role.id,
				profile: {
					firstName: createUserDto.firstName,
					lastName: createUserDto.lastName,
				},
			});
		} catch (error) {
			throw new NotFoundException('User could not be created', {
				cause: error,
				description: 'An error occurred while creating the user.',
			});
		}
	}

	/**
	 * Finds users with pagination, filtering, and sorting options.
	 *
	 * @param options - Pagination and filtering options.
	 * @returns A promise that resolves to an object containing the count of users and the rows of users.
	 * @example
	 * ```typescript
	 * const result = await usersService.search({
	 *   includeDeleted: false,
	 *   limit: 20,
	 *   page: 1,
	 *   search: 'John Doe',
	 *   sortBy: 'title',
	 *   sortOrder: 'asc',
	 * });
	 * console.log(result.count); // Total number of users found matching the criteria
	 * console.log(result.rows); // Array of Book instances
	 * ```
	 *
	 * @throws {NotFoundException} if no books are found.
	 */
	async search(options?: PaginateUsersDto): Promise<{
		count: number;
		rows: UserVo[];
	}> {
		const {
			includeDeleted = false,
			limit = 10,
			page = 1,
			search = '',
			sortBy = 'email',
			sortOrder = 'asc',
		} = options || {};
		const findOptions: FindOptions<UserAttributes> = {
			paranoid: !includeDeleted,
			include: [Profile, Role],
			limit,
			offset: (page - 1) * limit,
			order: [[sortBy, sortOrder.toUpperCase()]],
			where: {},
			attributes: [
				'createdAt',
				'email',
				['$profile.firstName$', 'firstName'],
				'isActive',
				['$profile.lastName$', 'lastName'],
				['$role.name$', 'roleName'],
				'updatedAt',
			],
		};
		if (search) {
			findOptions.where = {
				[Op.or]: [
					{ email: { [Op.iLike]: `%${search}%` } },
					{ '$profile.firstName$': { [Op.iLike]: `%${search}%` } },
					{ '$profile.lastName$': { [Op.iLike]: `%${search}%` } },
				],
			};
		}
		const result = await this.usersRepository.paginate<UserVo>(
			page,
			limit,
			findOptions,
		);

		if (result.totalRecords === 0) {
			throw new NotFoundException(
				'No users found matching the criteria.',
			);
		}

		return {
			count: result.totalRecords,
			rows: result.data,
		};
	}

	private _generateRandomPassword(
		length: number = env.APP.MIN_PASSWORD_LENGTH,
	): string {
		const charset =
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
		let password = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			password += charset[randomIndex];
		}
		return password;
	}
}
