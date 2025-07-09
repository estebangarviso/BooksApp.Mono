import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
} from '@nestjs/common';
import { type FastifyRequest } from 'fastify';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator';
import { type TLoginDto } from '../schemas/login.dto';
import { AuthService } from '../services/auth.service';
import { AuthControllerDocs } from './auth.controller.docs';

@ApplyControllerDocs(AuthControllerDocs)
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	signIn(@Body() signInDto: TLoginDto) {
		return this.authService.signIn(signInDto.username, signInDto.password);
	}

	@HttpCode(HttpStatus.OK)
	@Post('logout')
	async signOut(@Req() req: FastifyRequest & { user: { id: string } }) {
		await this.authService.signOut(req.user.id);
		return { message: 'Successfully logged out.' };
	}
}
