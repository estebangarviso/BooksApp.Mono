import { Body, Controller, Post } from '@nestjs/common';
import { AuthGuards, RequiredPermits, RequiredRoles } from '#libs/decorators';
import { Roles } from '#libs/enums';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
@AuthGuards()
export class UsersController {
	constructor(private readonly _userService: UsersService) {}

	@RequiredRoles([Roles.ADMIN])
	@RequiredPermits([Permits.CREATE_USER])
	@Post('create')
	createUser(@Body() createUserDto: CreateUserDto) {
		return this._userService.create(createUserDto);
	}
}
