import { UseGuards } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { AttributeBasedAccessGuard, RoleBasedAccessGuard } from '../guards';

/**
 * Symbol to mark a route as requiring specific roles.
 * This is useful for routes that require role-based access control.
 */
export const REQUIRED_ROLES = Symbol('required-roles');

/**
 * Symbol to mark a route as requiring specific permissions.
 * This is useful for routes that require role-based access control.
 */
export const REQUIRED_PERMISSIONS = Symbol('required-permissions');

/**
 * Decorator to mark a route as requiring a specific permission.
 * This means that the route can only be accessed by users with the specified permission.
 * It sets metadata that can be used by guards to determine access control.
 *
 * @param permissions - The permissions required to access the route.
 * @returns {MethodDecorator} A method decorator that sets the PERMISSION_KEY metadata.
 * @example
 * ```ts
 * \@RequirePermission('view_reports')
 * \@Get('reports')
 * getReports() {
 *   return 'History of reports';
 * }
 * // or
 * \@RequirePermission(['view_reports', 'edit_reports'])
 * \@Get('reports')
 * getReports() {
 *   return 'History of reports';
 * }
 * ```
 */
export const RequiredPermissions = (
	permissions: string[] | string,
): MethodDecorator =>
	SetMetadata(
		REQUIRED_PERMISSIONS,
		Array.isArray(permissions) ? permissions : [permissions],
	);

/**
 * Decorator to mark a route as requiring specific roles.
 * This means that the route can only be accessed by users with the specified roles.
 * It sets metadata that can be used by guards to determine access control.
 *
 * @param roles - The roles required to access the route.
 * @returns {MethodDecorator} A method decorator that sets the REQUIRED_ROLES metadata.
 * @example
 * ```ts
 * \@RequireRoles('admin')
 * \@Get('admin-dashboard')
 * getAdminDashboard() {
 *   return 'This is the admin dashboard';
 * }
 * // or
 * \@RequireRoles(['admin', 'editor'])
 * \@Get('admin-dashboard')
 * getAdminDashboard() {
 *   return 'This is the admin dashboard';
 * }
 * ```
 */
export const RequiredRoles = (roles: string[] | string): MethodDecorator =>
	SetMetadata(REQUIRED_ROLES, Array.isArray(roles) ? roles : [roles]);

/**
 * AuthGuards is a composite guard that combines the AttributeBasedAccessGuard and RoleBasedAccessGuard.
 * It is used to protect routes that require both authentication and role-based access control.
 *
 * @example
 * ```ts
 * \@Controller('protected')
 * \@AuthGuards()
 * export class ProtectedController {
 *   \@Get()
 *   \@RequirePermission('view_protected_resource')
 *   getProtectedResource() {
 *     return 'This is a protected resource';
 *   }
 * }
 * ```
 */
export const AuthGuards: () => ClassDecorator = () =>
	UseGuards(AttributeBasedAccessGuard, RoleBasedAccessGuard);
