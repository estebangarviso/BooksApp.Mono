import { Body, Controller, Post } from '@nestjs/common';
import {
	AuthGuards,
	RequiredPermissions,
	RequiredRoles,
} from '#libs/decorators';
import { AppPermission, AppRole } from '#libs/enums';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
@AuthGuards()
export class UsersController {
	constructor(private readonly _userService: UsersService) {}

	@RequiredRoles([AppRole.SUPER_ADMIN])
	@RequiredPermissions([AppPermission.USERS_CREATE])
	@Post('create')
	createUser(@Body() createUserDto: CreateUserDto) {
		return this._userService.create(createUserDto);
	}
}
