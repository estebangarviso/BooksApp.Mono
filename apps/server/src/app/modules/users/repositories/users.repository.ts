import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository, Permission, Profile, Role, User } from '#db';
import { CreationAttributes, Sequelize } from 'sequelize';
import { CreateUserDto } from '../dtos/create-user.dto';
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

	findOneByUsername(email: string): Promise<User | null> {
		return this._userModel.findOne({ where: { email } });
	}

	findWithPermissions(id: string): Promise<User | null> {
		return this._userModel.findByPk(id, {
			include: [
				{
					include: [Permission],
					model: Role,
				},
			],
		});
	}

	create(user: typeof CreateUserDto.schema.static): Promise<User> {
		return this._sequelize.transaction(async (t) => {
			const role = await this._roleModel.findByPk(user.roleId, {
				transaction: t,
			});
			if (!role) throw new BadRequestException('Role not found');

			if (user.profile)
				await this._profileModel.create(
					{
						firstName: user.profile.firstName,
						lastName: user.profile.lastName,
					} as CreationAttributes<Profile>,
					{ transaction: t },
				);
			const userAttributes = {
				email: user.email,
				password: user.password,
			} as CreationAttributes<User>;
			const createdUser = await this._userModel.create(userAttributes, {
				transaction: t,
			});

			return createdUser.reload({
				transaction: t,
				include: [
					{
						include: [Permission],
						model: Role,
					},
					Profile,
				],
			});
		});
	}
}
