import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Permission, Role, User } from '#db';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User)
		private readonly userModel: typeof User,
	) {}

	async findOne(username: string): Promise<User | undefined> {
		const result = await this.userModel.findOne({ where: { username } });

		if (!result) {
			return undefined;
		}

		return result;
	}

	findWithPermissions(id: string): Promise<User | null> {
		return this.userModel.findByPk(id, {
			include: [
				{
					include: [Permission],
					model: Role,
				},
			],
		});
	}

	async incrementTokenVersion(userId: string): Promise<void> {
		const user = await this.userModel.findByPk(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		user.tokenVersion += 1;
		await user.save();
	}
}
