import { Body, Controller, Post } from '@nestjs/common';
import {
	AuthGuards,
	RequiredPermissions,
	RequiredRoles,
} from '#libs/decorators';
import { AppPermission, AppRole } from '#libs/enums';
import { CreateUserResponseDto } from '../dtos/create-user-response.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
@AuthGuards()
export class UsersController {
	constructor(private readonly _userService: UsersService) {}

	@RequiredRoles([AppRole.ADMIN])
	@RequiredPermissions(AppPermission.USERS_CREATE)
	@Post('create')
	createUser(
		@Body() createUserDto: CreateUserDto,
	): Promise<CreateUserResponseDto> {
		return this._userService.createUserWithDetails(
			createUserDto as typeof CreateUserDto.schema.static,
		);
	}
}
