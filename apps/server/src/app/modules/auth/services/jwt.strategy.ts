import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { env } from '#config';
import { User } from '#db';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users.service'; // adjust the import path as necessary

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly usersService: UsersService) {
		super({
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: env.APP.SECURITY.JWT.SECRET,
		});
	}

	async validate(payload: any): Promise<User | null> {
		const user = await this.usersService.findWithPermissions(payload.sub);
		if (!user) {
			throw new UnauthorizedException();
		}
		// NOTE: if the token's version does not match the user's current version, it's invalid.
		if (user.tokenVersion !== payload.tokenVersion) {
			throw new UnauthorizedException('Token has been revoked');
		}
		return user;
	}
}
