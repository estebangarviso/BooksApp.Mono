import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository, Permission, Profile, Role, User } from '#db';
import { Sequelize } from 'sequelize';
import { type CreateUserWithDetailsDto } from '../dtos/create-user-and-profile.dto.ts';
import { IUsersRepository } from '../interfaces/users.repository.interface';

@Injectable()
export class UsersRepository
	extends BaseRepository<User>
	implements IUsersRepository
{
	constructor(
		@InjectModel(User)
		private readonly _userModel: typeof User,
		@InjectModel(Role)
		private readonly _roleModel: typeof Role,
		@InjectModel(Profile)
		private readonly _profileModel: typeof Profile,
		private readonly _sequelize: Sequelize,
	) {
		super(_userModel);
	}

	findOneByEmail(email: string): Promise<User | null> {
		return this._userModel.findOne({ where: { email } });
	}

	findOneWithPermissions(id: string): Promise<User | null> {
		return this._userModel.findByPk(id, {
			include: [
				{
					include: [Permission],
					model: Role,
				},
			],
		});
	}
	async findRoleByRoleId(roleId: number): Promise<Role | null> {
		try {
			const role = await this._roleModel.findByPk(roleId);
			if (!role) {
				return null;
			}
			return role;
		} catch (error) {
			throw new BadRequestException('Role not found', { cause: error });
		}
	}

	async createUserWithDetails(
		createUserWithDetailsDto: CreateUserWithDetailsDto,
	): Promise<User> {
		const transaction = await this._sequelize.transaction();
		try {
			const createdUser = await this._userModel.create<User>(
				{
					email: createUserWithDetailsDto.email,
					password: createUserWithDetailsDto.password,
					roleId: createUserWithDetailsDto.roleId,
				},
				{
					include: [Profile, Role],
					transaction,
				},
			);
			if (!createdUser) {
				throw new BadRequestException('User could not be created');
			}
			if (createUserWithDetailsDto.profile) {
				const [updatedProfile] = await this._profileModel.upsert(
					{
						userId: createdUser.id,
						...createUserWithDetailsDto.profile,
					},
					{
						transaction,
					},
				);
				if (!updatedProfile) {
					throw new BadRequestException(
						'Profile could not be updated',
					);
				}
				await createdUser.$set('profile', updatedProfile, {
					transaction,
				});
			}
			const savedUser = await createdUser.save({ transaction });
			await transaction.commit();
			return savedUser;
		} catch (error) {
			await transaction.rollback();
			throw new BadRequestException('User could not be created', {
				cause: error,
			});
		}
	}
}
