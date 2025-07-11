import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '#config';
import { UsersService } from '../../users/services/users.service';
import { JwtTokensDto } from '../dtos/jwt-tokens.dto';
import { LoginBodyDto } from '../dtos/login-body.dto';
import { RefreshAccessTokenDto } from '../dtos/refresh-access-token.dto';
import { AccessJwtPayload } from '../interfaces/access-jwt-payload.interface';
import { RefreshJwtPayload } from '../interfaces/refresh-jwt-payload.inteface';

@Injectable()
export class AuthService {
	constructor(
		private readonly _usersService: UsersService,
		private readonly _jwtService: JwtService,
	) {}

	/**
	 * Signs in a user with the provided email and password.
	 * If the credentials are valid, it returns an access token.
	 * @param {string} email - The email of the user.
	 * @param {string} pass - The password of the user.
	 * @returns {Promise<{ access_token: string }>} A promise that resolves to an object containing the access token.
	 * @throws {UnauthorizedException} If the user is not found or the password does not match.
	 */
	async signIn(
		loginBodyDto: LoginBodyDto,
	): Promise<typeof JwtTokensDto.schema.static> {
		const { email, password } =
			loginBodyDto as typeof LoginBodyDto.schema.static;
		const user = await this._usersService.findOneByUsername(email);
		if (!user) {
			throw new UnauthorizedException(undefined, {
				cause: 'User not found',
				description: 'The provided email does not exist.',
			});
		}

		const isPasswordMatching = await user.comparePassword(password);
		if (!isPasswordMatching) {
			throw new UnauthorizedException(undefined, {
				cause: 'Invalid password',
				description: 'The provided password does not match.',
			});
		}

		const [accessToken, refreshToken] = await Promise.all([
			this._generateAccessToken(user.id, user.email, user.tokenVersion),
			this._generateRefreshToken(user.id, user.tokenVersion),
		]);

		// update the user's refresh token and version
		await this._usersService.updateRefreshToken(user.id, refreshToken);

		return {
			accessToken,
			refreshToken,
		};
	}

	/**
	 * Signs out the user by incrementing the token version.
	 * This invalidates the current JWT and requires a new login to obtain a valid token.
	 * @returns {Promise<void>} A promise that resolves when the token version is incremented.
	 */
	signOut(userId: string): Promise<void> {
		return this._usersService.incrementTokenVersion(userId);
	}

	/**
	 * Refreshes the access token using the provided refresh token.
	 * Validates the refresh token against the user's stored refresh token.
	 * If valid, generates a new access token.
	 * @param {string} userId - The ID of the user.
	 * @param {string} refreshToken - The refresh token provided by the user.
	 * @returns {Promise<{ accessToken: string }>} A promise that resolves to an object containing the new access token.
	 * @throws {ForbiddenException} If the user is not found, the refresh token does not match, or if the refresh token is invalid.
	 */
	async refreshAccessToken(
		userId: string,
		refreshToken: string,
	): Promise<typeof RefreshAccessTokenDto.schema.static> {
		const user = await this._usersService.findOneById(userId);
		if (!user || !user.refreshToken) {
			throw new ForbiddenException('Access Denied', {
				cause: 'User not found or already logged out',
			});
		}

		const isRefreshTokenMatching =
			await user.compareRefreshToken(refreshToken);
		// if the refresh token does not match, throw an error.
		// This prevents unauthorized access using an invalid or expired refresh token.
		if (!isRefreshTokenMatching) {
			throw new ForbiddenException('Access Denied', {
				cause: 'Invalid refresh token',
			});
		}

		const accessToken = await this._generateAccessToken(
			user.id,
			user.email,
			user.tokenVersion,
		);

		return { accessToken };
	}

	/**
	 * Generates a new access token for the user.
	 * @param {string} userId - The ID of the user.
	 * @param {string} email - The email of the user.
	 * @param {number} tokenVersion - The current token version of the user.
	 * @returns {Promise<string>} A promise that resolves to the generated access token.
	 */
	private _generateAccessToken(
		userId: string,
		email: string,
		tokenVersion: number,
	): Promise<string> {
		const payload: AccessJwtPayload = {
			email,
			sub: userId,
			tokenVersion,
		};

		return this._jwtService.signAsync(payload, {
			expiresIn: env.APP.SECURITY.JWT.TOKENS.ACCESS_TOKEN.EXPIRES_IN,
			secret: env.APP.SECURITY.JWT.TOKENS.ACCESS_TOKEN.SECRET,
		});
	}

	/**
	 * Generates a new refresh token for the user.
	 * @param {string} userId - The ID of the user.
	 * @param {number} tokenVersion - The current token version of the user.
	 * @returns {Promise<string>} A promise that resolves to the generated refresh token.
	 */
	private _generateRefreshToken(
		userId: string,
		tokenVersion: number,
	): Promise<string> {
		const payload: RefreshJwtPayload = {
			sub: userId,
			tokenVersion,
		};

		return this._jwtService.signAsync(payload, {
			expiresIn: env.APP.SECURITY.JWT.TOKENS.REFRESH_TOKEN.EXPIRES_IN,
			secret: env.APP.SECURITY.JWT.TOKENS.REFRESH_TOKEN.SECRET,
		});
	}
}
