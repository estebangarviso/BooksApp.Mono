import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '#db';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredPermission = this.reflector.getAllAndOverride<string>(
			PERMISSION_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!requiredPermission) {
			// if no permission is required, access is granted.
			return true;
		}

		const { user } = context.switchToHttp().getRequest();
		if (!user || !user.role) {
			// no user or role attached to the request
			return false;
		}

		// check if the user's role's permissions include the required permission.
		// NOTE: This assumes the user object attached by the JWT strategy includes the role with its permissions.
		// You must update your JWT strategy to eager load this relationship.
		return user.role.permissions.some(
			(permission: Permission) =>
				permission.action === requiredPermission,
		);
	}
}
