import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_UNAUTHORIZED } from '#libs/decorators';
import { JwtStrategyTypes } from '../../app/modules/auth/auth.constant';

/**
 * Attribute-based access guard.
 * @description
 * This guard uses the JWT strategy to authenticate requests based on access tokens.
 * It is used to protect routes that require authentication.
 * @example
 *
 * ```ts
 * import { Controller, Get, UseGuards } from '@nestjs/common';
 * import { AttributeBasedAccessGuard } from './guards/abac.guard';
 *
 * \@Controller('protected')
 * export class ProtectedController {
 *   \@UseGuards(AttributeBasedAccessGuard)
 *   \@Get()
 *   getProtectedResource() {
 *     return 'This is a protected resource';
 *   }
 * }
 *
 * [i] This guard checks for the presence of a valid JWT in the request header.
 * - If the JWT is valid, it allows the request to proceed.
 * - If the JWT is invalid or missing, it throws an UnauthorizedException.
 * - If the route is marked with \@AllowUnauthorized, it skips authentication and allows public access.
 * ```
 */
@Injectable()
export class AttributeBasedAccessGuard extends AuthGuard(
	JwtStrategyTypes.ACCESS,
) {
	/**
	 * Determines if the request is allowed to pass through the guard.
	 * If the request has the ALLOW_UNAUTHORIZED metadata, it allows the request to pass through.
	 * Otherwise, it calls the parent class's `canActivate` method to perform the authentication check.
	 *
	 * @param context - The execution context of the request.
	 * @returns A boolean indicating whether the request is allowed to pass through.
	 */
	canActivate(context: ExecutionContext) {
		const isAllowUnauthorized = this._reflector.getAllAndOverride<boolean>(
			ALLOW_UNAUTHORIZED,
			[context.getHandler(), context.getClass()],
		);
		// if the route is marked with @AllowUnauthorized, skip authentication.
		// This allows public access to certain routes without authentication.
		if (isAllowUnauthorized) {
			return true;
		}
		return super.canActivate(context);
	}
	constructor(private readonly _reflector: Reflector) {
		super();
	}
}
