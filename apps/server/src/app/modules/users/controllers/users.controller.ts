import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import {
	AuthGuards,
	RequiredPermissions,
	RequiredRoles,
} from '#libs/decorators';
import { AppPermission, AppRole } from '#libs/enums';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.ts';
import { CreateUserDto } from '../dtos/create-user.dto';
import { CreateUserInterceptor } from '../interceptors/create-user.interceptor.ts';
import { UsersService } from '../services/users.service';
import { UsersControllerDocs } from './users.controller.docs.ts';

@ApplyControllerDocs(UsersControllerDocs)
@Controller('users')
@AuthGuards()
export class UsersController {
	constructor(private readonly _userService: UsersService) {}

	@RequiredRoles([AppRole.ADMIN])
	@RequiredPermissions(AppPermission.USERS_CREATE)
	@UseInterceptors(CreateUserInterceptor)
	@Post('create')
	async createUser(@Body() createUserDto: CreateUserDto) {
		await this._userService.createUserWithDetails(createUserDto);
	}
}
