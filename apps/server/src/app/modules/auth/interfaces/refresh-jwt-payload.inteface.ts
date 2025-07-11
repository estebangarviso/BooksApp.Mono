import { type AccessJwtPayload } from './access-jwt-payload.interface';

export interface RefreshJwtPayload
	extends Pick<AccessJwtPayload, 'sub' | 'tokenVersion'> {}
