import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '#db';
import { AppPermission, AppRole } from '#libs/enums';
import {
	REQUIRED_PERMISSIONS,
	REQUIRED_ROLES,
} from '../decorators/auth.decorator';

/**
 * Permissions guard.
 * This guard checks if the user has the required permission to access a route.
 * It uses the `@RequirePermission` decorator to specify the required permission.
 * If no permission is required, access is granted by default.
 * It assumes that the user object attached to the request includes the role with its permissions.
 *
 * @see https://docs.nestjs.com/security/authorization
 */
@Injectable()
export class RoleBasedAccessGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: User }>();
		const user = request.user;

		if (!user || !user.role) {
			return false; // no user or role attached to the request
		}
		// super admin has all permissions and roles, so we allow access
		if (user.role.name === AppRole.SUPER_ADMIN) {
			return true;
		}
		const requiredRoles = this.reflector.getAllAndOverride<
			AppRole[] | undefined
		>(REQUIRED_ROLES, [context.getHandler(), context.getClass()]);
		const requiredPermissions = this.reflector.getAllAndOverride<
			AppPermission[] | undefined
		>(REQUIRED_PERMISSIONS, [context.getHandler(), context.getClass()]);

		return (
			this.hasRole(user, requiredRoles) &&
			this.hasPermission(user, requiredPermissions)
		);
	}

	/**
	 * Checks if the user has the required permission.
	 * @param user - The user object attached to the request.
	 * @param permissions - The required permissions.
	 * @returns {boolean} - Returns true if the user has the required permission, false otherwise.
	 */
	hasPermission(
		user: User,
		requiredPermissions: AppPermission[] = [],
	): boolean {
		if (requiredPermissions.length === 0) {
			return true; // no permissions required, access granted
		}
		if (!user || !user.role) return false;
		const userPermissions =
			user.role.permissions?.map((p) => p.action) || [];
		return requiredPermissions.every((requiredPermission) =>
			userPermissions.includes(requiredPermission),
		);
	}

	/**
	 * Checks if the user has the required role.
	 * @param user - The user object attached to the request.
	 * @param roles - The required roles.
	 * @returns {boolean} - Returns true if the user has the required role, false otherwise.
	 */
	hasRole(user: User, roles: AppRole[] = []): boolean {
		if (roles.length === 0) {
			return true; // no roles required, access granted
		}
		return roles.includes(user.role.name);
	}
}
