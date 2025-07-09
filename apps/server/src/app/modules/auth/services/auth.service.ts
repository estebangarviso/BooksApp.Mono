import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	/**
	 * Signs in a user with the provided username and password.
	 * If the credentials are valid, it returns an access token.
	 * @param {string} username - The username of the user.
	 * @param {string} pass - The password of the user.
	 * @returns {Promise<{ access_token: string }>} A promise that resolves to an object containing the access token.
	 * @throws {UnauthorizedException} If the user is not found or the password does not match.
	 */
	async signIn(
		username: string,
		pass: string,
	): Promise<{ access_token: string }> {
		const user = await this.usersService.findOne(username);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const isPasswordMatching = await bcrypt.compare(pass, user.password);
		if (!isPasswordMatching) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const payload = {
			sub: user.id,
			tokenVersion: user.tokenVersion,
			username: user.username,
		};
		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}

	/**
	 * Signs out the user by incrementing the token version.
	 * This invalidates the current JWT and requires a new login to obtain a valid token.
	 * @returns {Promise<void>} A promise that resolves when the token version is incremented.
	 */
	async signOut(): Promise<void> {
		return this.usersService.incrementTokenVersion(userId);
	}
}
