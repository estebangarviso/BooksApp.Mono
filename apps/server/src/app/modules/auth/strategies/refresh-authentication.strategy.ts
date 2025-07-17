import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { env } from '#config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtStrategyTypes } from '../auth.constant';
import { RefreshJwtPayload } from '../interfaces/refresh-jwt-payload.interface';

@Injectable()
export class RefreshAuthenticationStrategy extends PassportStrategy(
	Strategy,
	JwtStrategyTypes.REFRESH,
) {
	constructor() {
		super({
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
			secretOrKey: env.APP.SECURITY.JWT.TOKENS.ACCESS_TOKEN.SECRET,
		});
	}

	validate(payload: any): RefreshJwtPayload {
		return {
			sub: payload.sub,
			tokenVersion: payload.tokenVersion,
		};
	}
}
