import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '#db';
import { CreateUserResponseDto } from '../dtos/create-user-response.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import {
	type IUsersRepository,
	USERS_REPOSITORY,
} from '../interfaces/users.repository.interface';

@Injectable()
export class UsersService {
	constructor(
		@Inject(USERS_REPOSITORY)
		private readonly usersRepository: IUsersRepository,
	) {}

	findOneByUsername(email: string): Promise<User | null> {
		return this.usersRepository.findOneByUsername(email);
	}

	findOneById(id: string): Promise<User | null> {
		return this.usersRepository.findOne(id);
	}

	findWithPermissions(id: string): Promise<User | null> {
		return this.usersRepository.findWithPermissions(id);
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

	async create(
		user: CreateUserDto,
	): Promise<typeof CreateUserResponseDto.schema.static> {
		try {
			const createdUser = await this.usersRepository.create(
				user as typeof CreateUserDto.schema.static,
			);
			if (!createdUser) {
				throw new NotFoundException('User could not be created');
			}
			return CreateUserResponseDto.schema.parse(createdUser);
		} catch (error) {
			throw new NotFoundException('User could not be created', {
				cause: error,
				description: 'An error occurred while creating the user.',
			});
		}
	}
}
