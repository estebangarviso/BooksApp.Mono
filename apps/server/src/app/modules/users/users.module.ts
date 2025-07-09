import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '#db';
import { UsersService } from './services/users.service';

@Module({
	providers: [UsersService],
	exports: [UsersService],
	imports: [SequelizeModule.forFeature([User])],
})
export class UsersModule {}
