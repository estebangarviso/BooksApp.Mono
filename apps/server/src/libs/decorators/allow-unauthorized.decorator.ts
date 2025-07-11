import { SetMetadata } from '@nestjs/common';

/**
 * Symbol to mark a route as allowing unauthorized access.
 * This is useful for routes that do not require authentication or authorization.
 * @see https://docs.nestjs.com/custom-decorators
 */
export const ALLOW_UNAUTHORIZED = Symbol('allow-unauthorized');

/**
 * Decorator to mark a route as allowing unauthorized access.
 * This means that the route can be accessed without authentication.
 * It sets metadata that can be used by guards to determine access control.
 *
 * @returns {MethodDecorator} A method decorator that sets the ALLOW_UNAUTHORIZED metadata.
 * @example
 * ```ts
 * \@AllowUnauthorized()
 * \@Get('public-endpoint')
 * publicEndpoint() {
 *   return 'This endpoint is accessible without authentication';
 * }
 * ```
 */
export const AllowUnauthorized = (): MethodDecorator =>
	SetMetadata(ALLOW_UNAUTHORIZED, true);
