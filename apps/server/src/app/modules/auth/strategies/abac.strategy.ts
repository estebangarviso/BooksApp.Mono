import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { env } from '#config';
import { User } from '#db';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users.service'; // adjust the import path as necessary
import { JwtStrategyTypes } from '../auth.constant';
/**
 * Authentication-based access strategy.
 * @description
 * This strategy uses JWT to authenticate users based on access tokens.
 * It validates the token and retrieves the user with their permissions.
 * If the user is not found or the token version does not match, it throws an UnauthorizedException.
 */
@Injectable()
export class AuthenticationBasedAccessStrategy extends PassportStrategy(
	Strategy,
	JwtStrategyTypes.ACCESS,
) {
	constructor(private readonly _usersService: UsersService) {
		super({
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: env.APP.SECURITY.JWT.TOKENS.ACCESS_TOKEN.SECRET,
		});
	}

	async validate(payload: any): Promise<User | null> {
		const user = await this._usersService.findWithPermissions(payload.sub);
		if (!user) {
			throw new UnauthorizedException(undefined, {
				cause: 'User not found',
				description:
					'The user associated with this token does not exist.',
			});
		}
		// NOTE: if the token's version does not match the user's current version, it's invalid.
		if (user.tokenVersion !== payload.tokenVersion) {
			throw new UnauthorizedException(undefined, {
				cause: 'Token version mismatch',
				description:
					"The token version does not match the user's current version.",
			});
		}
		return user;
	}
}
