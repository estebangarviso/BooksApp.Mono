import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '#db';
import { USERS_REPOSITORY } from './interfaces/users.repository.interface';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './services/users.service';

/**
 * Users module for managing user-related operations.
 *
 * @export
 * @class UsersModule
 */
@Module({
	providers: [
		UsersService,
		{
			provide: USERS_REPOSITORY,
			useClass: UsersRepository,
		},
	],
	exports: [UsersService],
	imports: [SequelizeModule.forFeature([User])],
})
export class UsersModule {}
