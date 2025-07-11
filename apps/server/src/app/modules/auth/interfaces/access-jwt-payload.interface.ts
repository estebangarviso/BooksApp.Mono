import { type Permits } from '../../../../libs/enums/permits.enum';

export interface AccessJwtPayload {
	/**
	 * Email of the user.
	 */
	email: string;
	/**
	 * Unique identifier for the user, typically the user ID.
	 */
	sub: string;
	/**
	 * Token version to handle token invalidation.
	 */
	tokenVersion: number;
}

export interface AccessJwtPayloadWithRefreshToken extends AccessJwtPayload {
	/**
	 * Refresh token associated with the user.
	 */
	refreshToken: string;

	/**
	 * Optional field to include additional data.
	 */
	permits?: Permits[];
}
