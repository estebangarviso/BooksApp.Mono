import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { env } from '#config';
import { User } from '#db';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users.service'; // adjust the import path as necessary
import { JwtStrategyTypes } from '../auth.constant';

/**
 * Attribute-based access strategy.
 * @description
 * This strategy uses JWT to authenticate users based on access tokens.
 * It validates the token and retrieves the user with their permissions.
 * If the user is not found or the token version does not match, it throws an UnauthorizedException.
 */
@Injectable()
export class AttributeBasedAccessStrategy extends PassportStrategy(
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

	/**
	 * Validates the JWT payload and retrieves the user.
	 *
	 * @description
	 * This method will be called automatically by Passport when a request is made with a valid JWT.
	 * - It checks if the user exists and if the token version matches the user's current version.
	 * - If the user is not found or the token version does not match, it throws an UnauthorizedException.
	 *
	 * @see https://docs.nestjs.com/recipes/passport
	 * @param {any} payload - The JWT payload containing user information.
	 * @returns {Promise<User>} The authenticated user with permissions attached to the request object.
	 * @throws {UnauthorizedException} If the user is not found or the token version does not match.
	 */
	async validate(payload: any): Promise<User> {
		const user = await this._usersService.findOneWithPermissions(
			payload.sub,
		);
		if (!user) {
			throw new UnauthorizedException(undefined, {
				cause: 'User not found',
				description:
					'The user associated with this token does not exist.',
			});
		}
		// NOTE: if the token's version does not match the user's current version, means has been invalidated. This is a security measure to prevent replay attacks.
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
